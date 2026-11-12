from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class LoginRequest(BaseModel):
    phone: str = Field(..., description="Indian mobile number (10 digits or E.164 +91)")
    password: str = Field(..., description="Account password")

class UserOut(BaseModel):
    userId: str
    phone: str
    name: str
    role: str
    allowedPlotIds: List[str]

class TokenResponse(BaseModel):
    accessToken: str
    refreshToken: Optional[str] = None
    tokenType: str = "Bearer"
    expiresIn: int
    user: UserOut

class RefreshTokenRequest(BaseModel):
    refreshToken: str

class AdminUnlockRequest(BaseModel):
    phone: str

class PlotGeometryIn(BaseModel):
    type: str = "Polygon"
    coordinates: List[List[List[float]]]

class PlotRegisterRequest(BaseModel):
    farmerName: str
    phone: str
    passbookNo: str
    coordinates: List[List[float]] # [[lon, lat], ...]
    utmZone: Optional[int] = 44
    idempotencyKey: Optional[str] = None

class PhotoUploadMeta(BaseModel):
    slotId: str
    targetHeadingDeg: float
    deviceHeading: Optional[float] = None
    deviceLat: Optional[float] = None
    deviceLon: Optional[float] = None
    accuracyM: Optional[float] = None

class AuditRecordOut(BaseModel):
    index: int
    timestamp: str
    action: str
    actor: str
    details: Dict[str, Any]
    prevHash: str
    currentHash: str

class VerifyChainResponse(BaseModel):
    valid: bool
    totalChecked: int
    brokenIdx: int
    recomputedRootHash: str
    timestamp: str

class SystemHealthOut(BaseModel):
    status: str
    version: str
    timestamp: str
    minAppVersion: str
    coldStartHandled: bool = True

class ConsoleDataOut(BaseModel):
    status: str
    uptimeSeconds: float
    totalRequests: int
    recentLogs: List[Dict[str, Any]]
    lockedAccounts: List[Dict[str, Any]]
    auditChainLength: int
    latestRootHash: str
    isAuditValid: bool
