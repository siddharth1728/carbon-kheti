from fastapi import APIRouter, HTTPException, Depends, status
import time
from typing import Dict, Any, List
from ..models import AdminUnlockRequest, ConsoleDataOut
from ..limiter import limiter
from ..database import db
from .auth import get_current_user_from_token

router = APIRouter(prefix="/admin", tags=["Admin Console"])

def require_admin_user(user: dict = Depends(get_current_user_from_token)):
    if user.get("role") not in ["admin", "verifier"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required."
        )
    return user

@router.post("/unlock-account")
async def unlock_account(req: AdminUnlockRequest, user: dict = Depends(require_admin_user)):
    cleaned_phone = req.phone.strip()
    if not cleaned_phone.startswith("+91") and len(cleaned_phone) == 10:
        cleaned_phone = f"+91{cleaned_phone}"
    
    unlocked = limiter.admin_unlock(cleaned_phone)
    return {
        "success": True,
        "phone": cleaned_phone,
        "message": f"Account {cleaned_phone} has been unlocked." if unlocked else f"Account {cleaned_phone} was not locked."
    }

@router.post("/reset-demo")
async def reset_demo(user: dict = Depends(require_admin_user)):
    db.reset_demo_state()
    return {
        "success": True,
        "message": "Demo state restored to clean Genesis block and pristine plot catalog."
    }

@router.get("/logs")
async def get_logs(limit: int = 50, user: dict = Depends(require_admin_user)) -> List[Dict[str, Any]]:
    return db.request_logs[-limit:]

@router.get("/console-data", response_model=ConsoleDataOut)
async def get_console_data(user: dict = Depends(require_admin_user)):
    uptime = time.time() - db.start_time
    verify_res = db.verify_chain()
    
    # Active locked accounts
    locked_accounts = []
    for ph, rec in list(limiter._records.items()):
        locked, rem = limiter.is_locked(ph)
        if locked:
            locked_accounts.append({
                "phone": ph,
                "remainingSeconds": rem,
                "attempts": rec.get("attempts", 0)
            })

    return ConsoleDataOut(
        status="healthy",
        uptimeSeconds=round(uptime, 1),
        totalRequests=len(db.request_logs),
        recentLogs=db.request_logs[-20:],
        lockedAccounts=locked_accounts,
        auditChainLength=len(db.audit_chain),
        latestRootHash=db.audit_chain[-1]["currentHash"] if db.audit_chain else "",
        isAuditValid=verify_res.get("valid", False)
    )
