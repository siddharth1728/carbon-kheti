from fastapi import APIRouter, HTTPException, Header, Depends, status
from typing import Optional, List
import uuid
from ..models import PlotRegisterRequest
from ..database import db
from .auth import get_current_user_from_token

router = APIRouter(prefix="/plots", tags=["Plots"])

@router.get("")
async def list_plots(user: dict = Depends(get_current_user_from_token)):
    role = user.get("role")
    allowed = user.get("allowedPlotIds", [])
    
    if role in ["admin", "verifier", "buyer"] or "*" in allowed:
        return list(db.plots.values())
    
    # Farmer tenant isolation: only their own plots
    return [p for p in db.plots.values() if p["id"] in allowed]

@router.get("/{plot_id}")
async def get_plot(plot_id: str, user: dict = Depends(get_current_user_from_token)):
    role = user.get("role")
    allowed = user.get("allowedPlotIds", [])
    
    # Strict tenant isolation
    if role == "farmer" and "*" not in allowed and plot_id not in allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You do not have permission to view this plot."
        )
    
    plot = db.plots.get(plot_id)
    if not plot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plot not found.")
    return plot

@router.post("/register")
async def register_plot(
    req: PlotRegisterRequest,
    x_idempotency_key: Optional[str] = Header(None, alias="X-Idempotency-Key"),
    user: dict = Depends(get_current_user_from_token)
):
    # 1. Idempotency Check
    idemp_key = x_idempotency_key or req.idempotencyKey
    if idemp_key and idemp_key in db.idempotency_cache:
        return db.idempotency_cache[idemp_key]

    # 2. Coordinates validation
    coords = req.coordinates
    if len(coords) < 4:
        raise HTTPException(status_code=400, detail="A polygon requires at least 4 coordinates to form a closed loop.")

    # 3. Dynamic UTM Zone selection: Lon < 78.0 is Zone 43N (Western Telangana), Lon >= 78.0 is Zone 44N
    c_lon = coords[0][0]
    utm_zone = 43 if c_lon < 78.0 else 44

    # Calculate area (approx metric based on lat/lon bounding)
    # 1 deg lat ~ 111,000m; 1 deg lon ~ 106,000m in Telangana
    min_lon = min(c[0] for c in coords)
    max_lon = max(c[0] for c in coords)
    min_lat = min(c[1] for c in coords)
    max_lat = max(c[1] for c in coords)
    w_m = (max_lon - min_lon) * 106000
    h_m = (max_lat - min_lat) * 111000
    area_m2 = round(max(w_m * h_m * 0.8, 800.0), 1)
    
    # Explicit conversion rule: m2 / 10,000 = Hectares
    area_ha = round(area_m2 / 10000.0, 3)
    area_acres = round(area_ha * 2.47105, 3)

    # Effective pixels after 10m inner buffer: pixel_grid ~ 10m x 10m
    effective_pixels = max(0, round((area_m2 * 0.65) / 100.0, 1))
    is_below_minimum = effective_pixels < 8.0

    new_plot_id = f"TS-NEW-{uuid.uuid4().hex[:4].upper()}"
    new_plot = {
        "id": new_plot_id,
        "name": f"Registered Plot ({req.passbookNo})",
        "farmerName": req.farmerName,
        "phone": req.phone,
        "district": "Telangana State",
        "state": "Telangana",
        "utmZone": utm_zone,
        "areaM2": area_m2,
        "areaHa": area_ha,
        "areaAcres": area_acres,
        "effectivePixels": effective_pixels,
        "isBelowMinimum": is_below_minimum,
        "lat": coords[0][1],
        "lon": coords[0][0],
        "status": "pending_verification" if not is_below_minimum else "insufficient_pixels_clustered",
        "coordinates": coords,
        "passbookNo": req.passbookNo,
        "grossMeanCo2ePerHa": 3.85,
        "finalCreditsPerHa": 1.42 if not is_below_minimum else 0.0,
        "totalIssuableCo2e": round(1.42 * area_ha, 2) if not is_below_minimum else 0.0,
    }

    db.plots[new_plot_id] = new_plot
    user["allowedPlotIds"].append(new_plot_id)

    # Append to cryptographic audit chain
    record = db.append_audit_record(
        action="PLOT_REGISTERED",
        actor=user.get("name", "FARMER_CLIENT"),
        details={
            "plotId": new_plot_id,
            "passbookNo": req.passbookNo,
            "areaM2": area_m2,
            "areaHa": area_ha,
            "utmZone": utm_zone,
            "effectivePixels": effective_pixels,
            "isBelowMinimum": is_below_minimum
        }
    )

    result = {
        "success": True,
        "plot": new_plot,
        "auditRecord": record
    }

    if idemp_key:
        db.idempotency_cache[idemp_key] = result

    return result
