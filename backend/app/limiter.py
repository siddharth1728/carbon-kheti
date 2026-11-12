import time
from typing import Dict, Tuple, Optional
from .config import settings

class LoginRateLimiter:
    def __init__(self):
        # key: phone_e164 -> {"attempts": int, "locked_until": float, "last_attempt": float}
        self._records: Dict[str, dict] = {}

    def is_locked(self, identifier: str) -> Tuple[bool, int]:
        now = time.time()
        record = self._records.get(identifier)
        if not record:
            return False, 0

        locked_until = record.get("locked_until", 0)
        if locked_until > now:
            remaining_seconds = int(locked_until - now)
            return True, remaining_seconds

        # Lockout expired, reset if needed
        if locked_until > 0 and locked_until <= now:
            del self._records[identifier]

        return False, 0

    def record_failure(self, identifier: str) -> Tuple[int, bool, int]:
        now = time.time()
        record = self._records.get(identifier, {"attempts": 0, "locked_until": 0, "last_attempt": now})
        
        # Reset counter if last attempt was > 1 hour ago
        if now - record.get("last_attempt", now) > 3600:
            record["attempts"] = 0

        record["attempts"] += 1
        record["last_attempt"] = now

        if record["attempts"] >= settings.MAX_LOGIN_ATTEMPTS:
            record["locked_until"] = now + settings.LOCKOUT_DURATION_SECONDS
            self._records[identifier] = record
            return record["attempts"], True, settings.LOCKOUT_DURATION_SECONDS

        self._records[identifier] = record
        return record["attempts"], False, 0

    def record_success(self, identifier: str):
        if identifier in self._records:
            del self._records[identifier]

    def admin_unlock(self, identifier: str) -> bool:
        if identifier in self._records:
            del self._records[identifier]
            return True
        return False

    def get_status(self, identifier: str) -> Optional[dict]:
        return self._records.get(identifier)

limiter = LoginRateLimiter()
