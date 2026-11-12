import os
import json
from typing import List

class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Carbon Kheti MRV API")
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "demo-super-secret-jwt-key-carbon-kheti-telangana-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))
    
    MIN_SUPPORTED_APP_VERSION: str = os.getenv("MIN_SUPPORTED_APP_VERSION", "1.0.0")
    APP_UPDATE_URL: str = os.getenv("APP_UPDATE_URL", "https://github.com/team-dosa/carbon-kheti/releases/latest")

    # Rate Limiting & Progressive Lockout
    MAX_LOGIN_ATTEMPTS: int = int(os.getenv("MAX_LOGIN_ATTEMPTS", "5"))
    LOCKOUT_DURATION_SECONDS: int = int(os.getenv("LOCKOUT_DURATION_SECONDS", "900"))  # 15 mins

    # CORS Whitelist: Web + Capacitor Android (https://localhost) + iOS (capacitor://localhost)
    _default_cors = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "https://localhost",
        "capacitor://localhost",
    ]
    CORS_ORIGINS: List[str] = json.loads(os.getenv("CORS_ORIGINS", json.dumps(_default_cors)))

settings = Settings()
