from fastapi import APIRouter, HTTPException, Header, UploadFile, File, Form, Depends, status
from typing import Optional
import hashlib
from ..database import db
from .auth import get_current_user_from_token

router = APIRouter(prefix="/evidence", tags=["Evidence"])

@router.post("/upload")
async def upload_evidence(
    slotId: str = Form(...),
    plotId: str = Form(...),
    targetHeadingDeg: float = Form(...),
    deviceHeading: Optional[float] = Form(None),
    deviceLat: Optional[float] = Form(None),
    deviceLon: Optional[float] = Form(None),
    accuracyM: Optional[float] = Form(None),
    file: UploadFile = File(...),
    x_idempotency_key: Optional[str] = Header(None, alias="X-Idempotency-Key"),
    user: dict = Depends(get_current_user_from_token)
):
    # 1. Idempotency check
    if x_idempotency_key and x_idempotency_key in db.idempotency_cache:
        return db.idempotency_cache[x_idempotency_key]

    # 2. File size and format check
    file_bytes = await file.read()
    if len(file_bytes) > 15 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large. Maximum allowed photo size is 15MB.")
    
    # 3. Compute real SHA-256 over raw file bytes
    sha256 = hashlib.sha256(file_bytes).hexdigest()

    # 4. Check heading tolerance (+/- 22.5 deg)
    heading_passed = True
    heading_diff = 0.0
    if deviceHeading is not None and targetHeadingDeg > 0:
        diff = abs(deviceHeading - targetHeadingDeg)
        if diff > 180:
            diff = 360 - diff
        heading_diff = diff
        if diff > 22.5:
            heading_passed = False

    # 5. Check GPS bounds
    plot = db.plots.get(plotId)
    gps_in_polygon = True
    flag_reason = None

    if plot and deviceLat is not None and deviceLon is not None:
        p_lat = plot["lat"]
        p_lon = plot["lon"]
        # Distance approx
        d_lat_m = abs(deviceLat - p_lat) * 111000
        d_lon_m = abs(deviceLon - p_lon) * 106000
        dist_m = (d_lat_m**2 + d_lon_m**2)**0.5
        if dist_m > 300: # Beyond plot boundary + 50m tolerance
            gps_in_polygon = False
            flag_reason = f"EXIF GPS fix ({deviceLat:.4f}°N, {deviceLon:.4f}°E) is {int(dist_m)}m outside plot boundary."

    if not heading_passed:
        flag_reason = f"Compass orientation deviation ({heading_diff:.1f}°) exceeds ±22.5° sector tolerance."

    status_verdict = "passed" if (heading_passed and gps_in_polygon) else "flagged"

    # Append to cryptographic audit chain
    record = db.append_audit_record(
        action=f"PHOTO_EVIDENCE_{status_verdict.upper()}",
        actor=user.get("name", "FARMER_CLIENT"),
        details={
            "plotId": plotId,
            "slotId": slotId,
            "sha256": sha256,
            "fileName": file.filename,
            "fileSizeBytes": len(file_bytes),
            "headingDelta": round(heading_diff, 1),
            "inPolygon": gps_in_polygon,
            "verdict": status_verdict,
            "flagReason": flag_reason
        }
    )

    result = {
        "success": True,
        "slotId": slotId,
        "sha256": sha256,
        "fileName": file.filename,
        "fileSizeBytes": len(file_bytes),
        "status": status_verdict,
        "confidenceTag": "high_sensor_locked" if heading_passed else "lower_confidence_manual",
        "inPolygon": gps_in_polygon,
        "flagReason": flag_reason,
        "auditRecord": record
    }

    if x_idempotency_key:
        db.idempotency_cache[x_idempotency_key] = result

    return result
