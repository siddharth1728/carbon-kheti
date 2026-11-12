import time
from datetime import datetime, timezone
from packaging import version
from fastapi import FastAPI, Request, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .database import db
from .routes import auth, plots, evidence, audit, admin, sentinel

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Auditable MRV Engine API for Smallholder Agroforestry in Telangana (Team DoSA, INNOVASIA 2K26, PS-13)",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
# Strictly whitelisting Web origins + Capacitor Android (https://localhost) + iOS (capacitor://localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
    allow_headers=["*"],
    expose_headers=["Retry-After", "X-App-Version", "X-Idempotency-Key"]
)

# Request Logging & App-Version Check Middleware
@app.middleware("http")
async def app_middleware(request: Request, call_next):
    start_time = time.time()
    path = request.url.path

    # Check App Version Contract for API requests
    if path.startswith("/api/"):
        app_version_hdr = request.headers.get("X-App-Version")
        if app_version_hdr:
            try:
                if version.parse(app_version_hdr) < version.parse(settings.MIN_SUPPORTED_APP_VERSION):
                    return JSONResponse(
                        status_code=status.HTTP_426_UPGRADE_REQUIRED,
                        content={
                            "error": "UPDATE_REQUIRED",
                            "message": f"App version {app_version_hdr} is no longer supported. Please update to version {settings.MIN_SUPPORTED_APP_VERSION} or higher.",
                            "clientVersion": app_version_hdr,
                            "minSupportedVersion": settings.MIN_SUPPORTED_APP_VERSION,
                            "updateUrl": settings.APP_UPDATE_URL
                        }
                    )
            except Exception:
                pass

    response = await call_next(request)
    duration_ms = (time.time() - start_time) * 1000

    # In-memory request log ring buffer
    client_ip = request.client.host if request.client else "unknown"
    client_type = request.headers.get("X-Client", "web")
    db.log_request(
        method=request.method,
        path=path,
        status_code=response.status_code,
        client_ip=client_ip,
        client_type=client_type,
        duration_ms=duration_ms
    )

    # Security Headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    return response

# Health & Readiness Endpoints
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "minAppVersion": settings.MIN_SUPPORTED_APP_VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "coldStartHandled": True
    }

@app.get("/ready", tags=["Health"])
async def readiness_check():
    verify_res = db.verify_chain()
    return {
        "status": "ready",
        "auditChainValid": verify_res.get("valid", False),
        "plotsCount": len(db.plots),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# Include API v1 Routers
api_v1 = FastAPI()
api_v1.include_router(auth.router)
api_v1.include_router(plots.router)
api_v1.include_router(evidence.router)
api_v1.include_router(audit.router)
api_v1.include_router(admin.router)
api_v1.include_router(sentinel.router)

app.mount(settings.API_V1_STR, api_v1)
