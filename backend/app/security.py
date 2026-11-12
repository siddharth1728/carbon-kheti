import re
import os
import hmac
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, Tuple
import jwt
from .config import settings

# Normalise phone number to E.164 (+91 followed by 10 digits)
def normalize_and_validate_indian_phone(phone_input: str) -> Tuple[bool, Optional[str], Optional[str]]:
    cleaned = re.sub(r'[\s\-\(\)]', '', phone_input.strip())
    
    # Matches: +91XXXXXXXXXX, 91XXXXXXXXXX, 0XXXXXXXXXX, or XXXXXXXXXX
    pattern = r'^(?:\+91|91|0)?([6-9]\d{9})$'
    match = re.match(pattern, cleaned)
    
    if not match:
        return False, None, "Invalid mobile number. Must be a valid 10-digit Indian phone starting with 6, 7, 8, or 9."
    
    national_number = match.group(1)
    e164 = f"+91{national_number}"
    return True, e164, None

# PBKDF2-HMAC-SHA256 password hashing with 100,000 rounds
def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return f"pbkdf2:sha256:100000${salt}${key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        parts = hashed_password.split('$')
        if len(parts) != 3:
            return False
        algorithm_meta, salt, key_hex = parts
        rounds = int(algorithm_meta.split(':')[2])
        computed = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            rounds
        )
        return hmac.compare_digest(computed.hex(), key_hex)
    except Exception:
        return False

# Token generation
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": now, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(user_id: str, family_id: Optional[str] = None) -> Tuple[str, str, str]:
    family = family_id or secrets.token_hex(16)
    jti = secrets.token_hex(16)
    now = datetime.now(timezone.utc)
    expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": user_id,
        "jti": jti,
        "family": family,
        "exp": expire,
        "iat": now,
        "type": "refresh"
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return token, jti, family

def decode_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except Exception:
        return None
