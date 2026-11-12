from fastapi import APIRouter, HTTPException, Header, Response, Request, status, Depends
from typing import Optional
from datetime import timedelta
from ..config import settings
from ..security import (
    normalize_and_validate_indian_phone,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from ..limiter import limiter
from ..models import LoginRequest, TokenResponse, RefreshTokenRequest, UserOut
from ..database import db

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_current_user_from_token(authorization: Optional[str] = Header(None), request: Request = None) -> dict:
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    elif request and "access_token" in request.cookies:
        token = request.cookies["access_token"]
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials missing.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    phone = payload.get("phone")
    user = db.users.get(phone)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")
    return user

@router.post("/login", response_model=TokenResponse)
async def login(
    req: LoginRequest,
    response: Response,
    x_client: Optional[str] = Header(None, alias="X-Client"),
):
    # 1. Normalise Indian mobile number to E.164
    is_valid, phone_e164, err = normalize_and_validate_indian_phone(req.phone)
    if not is_valid or not phone_e164:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err or "Invalid phone number")

    # 2. Check progressive rate limiting / lockout
    locked, remaining_secs = limiter.is_locked(phone_e164)
    if locked:
        mins = remaining_secs // 60
        secs = remaining_secs % 60
        time_str = f"{mins}m {secs}s" if mins > 0 else f"{secs}s"
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Account locked due to multiple failed login attempts. Please retry in {time_str}, or contact FPO Admin for instant unlock.",
            headers={"Retry-After": str(remaining_secs)}
        )

    # 3. Lookup user
    user = db.users.get(phone_e164)
    if not user:
        # Uniform failure message to prevent user enumeration
        attempts, is_now_locked, lock_dur = limiter.record_failure(phone_e164)
        if is_now_locked:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Account locked for {lock_dur // 60} minutes due to repeated failed attempts.",
                headers={"Retry-After": str(lock_dur)}
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid phone number or password. Attempt {attempts} of {settings.MAX_LOGIN_ATTEMPTS}."
        )

    # 4. Verify password
    if not verify_password(req.password, user["passwordHash"]):
        attempts, is_now_locked, lock_dur = limiter.record_failure(phone_e164)
        if is_now_locked:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Account locked for {lock_dur // 60} minutes due to repeated failed attempts.",
                headers={"Retry-After": str(lock_dur)}
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid phone number or password. Attempt {attempts} of {settings.MAX_LOGIN_ATTEMPTS}."
        )

    # 5. Success - Clear limiter
    limiter.record_success(phone_e164)

    # 6. Issue tokens
    access_token = create_access_token({
        "sub": user["userId"],
        "phone": user["phone"],
        "name": user["name"],
        "role": user["role"]
    })

    # Generate rotating refresh token
    refresh_token, jti, family = create_refresh_token(user["userId"])
    db.refresh_tokens[jti] = {
        "userId": user["userId"],
        "phone": user["phone"],
        "family": family,
        "revoked": False
    }

    # If web client, set httpOnly cookie
    is_mobile = x_client and x_client.lower() == "mobile"
    if not is_mobile:
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )

    user_out = UserOut(
        userId=user["userId"],
        phone=user["phone"],
        name=user["name"],
        role=user["role"],
        allowedPlotIds=user["allowedPlotIds"]
    )

    return TokenResponse(
        accessToken=access_token,
        refreshToken=refresh_token,
        tokenType="Bearer",
        expiresIn=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user_out
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_tokens(req: RefreshTokenRequest):
    payload = decode_token(req.refreshToken)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token.")

    jti = payload.get("jti")
    family = payload.get("family")
    user_id = payload.get("sub")

    # Reuse detection: if family is marked revoked, attack detected!
    if family in db.revoked_families:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token family revoked due to detected token reuse attack. Please log in again."
        )

    token_meta = db.refresh_tokens.get(jti)
    if not token_meta or token_meta.get("revoked"):
        # Revoke the entire family
        db.revoked_families.add(family)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token already used. Compromised token family revoked."
        )

    # Find user
    phone = token_meta["phone"]
    user = db.users.get(phone)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")

    # Mark old refresh token as revoked
    token_meta["revoked"] = True

    # Rotate: Issue new access token + new refresh token in same family
    new_access_token = create_access_token({
        "sub": user["userId"],
        "phone": user["phone"],
        "name": user["name"],
        "role": user["role"]
    })
    new_refresh_token, new_jti, _ = create_refresh_token(user["userId"], family_id=family)
    db.refresh_tokens[new_jti] = {
        "userId": user["userId"],
        "phone": user["phone"],
        "family": family,
        "revoked": False
    }

    user_out = UserOut(
        userId=user["userId"],
        phone=user["phone"],
        name=user["name"],
        role=user["role"],
        allowedPlotIds=user["allowedPlotIds"]
    )

    return TokenResponse(
        accessToken=new_access_token,
        refreshToken=new_refresh_token,
        tokenType="Bearer",
        expiresIn=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user_out
    )

@router.post("/logout")
async def logout(response: Response, req: Optional[RefreshTokenRequest] = None):
    response.delete_cookie("access_token")
    if req and req.refreshToken:
        payload = decode_token(req.refreshToken)
        if payload:
            jti = payload.get("jti")
            if jti in db.refresh_tokens:
                db.refresh_tokens[jti]["revoked"] = True
    return {"success": True, "message": "Logged out successfully."}

@router.post("/logout-everywhere")
async def logout_everywhere(user: dict = Depends(get_current_user_from_token)):
    # Revoke all refresh tokens for this user
    for meta in db.refresh_tokens.values():
        if meta["userId"] == user["userId"]:
            meta["revoked"] = True
            db.revoked_families.add(meta["family"])
    return {"success": True, "message": "All sessions terminated across all devices."}

@router.get("/me", response_model=UserOut)
async def get_me(user: dict = Depends(get_current_user_from_token)):
    return UserOut(
        userId=user["userId"],
        phone=user["phone"],
        name=user["name"],
        role=user["role"],
        allowedPlotIds=user["allowedPlotIds"]
    )
