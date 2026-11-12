from fastapi import APIRouter, HTTPException
from typing import Dict, Any

router = APIRouter(prefix="/sentinel", tags=["Sentinel Imagery"])

SENTINEL_METADATA = {
    "TS-RR-01": {
        "plotId": "TS-RR-01",
        "y1_scene": "S2A_MSIL2A_20251015T051011_N0500_R019_T44QME_20251015T094200",
        "y2_scene": "S2B_MSIL2A_20261014T050939_N0500_R019_T44QME_20261014T094112",
        "cloudCoverPct_Y1": 2.1,
        "cloudCoverPct_Y2": 3.4,
        "radarFallbackUsed": False,
        "usableScenesCount": 24,
        "layers": ["true_color", "ndvi", "sar_vh", "cloud_mask"],
        "anniversaryWindow": "October (Post-Monsoon Peak)"
    },
    "TS-KMM-04": {
        "plotId": "TS-KMM-04",
        "y1_scene": "S2A_MSIL2A_20251012T051219_N0500_R019_T44QME_20251012T094500",
        "y2_scene": "S1A_IW_GRDH_1SDV_20261013T004512_045120_05612A_B081",
        "cloudCoverPct_Y1": 18.5,
        "cloudCoverPct_Y2": 82.0, # High cloud -> SAR fallback
        "radarFallbackUsed": True,
        "usableScenesCount": 11,
        "layers": ["true_color", "ndvi", "sar_vh", "cloud_mask"],
        "anniversaryWindow": "October (Post-Monsoon Peak)"
    }
}

@router.get("/plots/{plot_id}/layers")
async def get_sentinel_layers(plot_id: str) -> Dict[str, Any]:
    meta = SENTINEL_METADATA.get(plot_id, SENTINEL_METADATA["TS-RR-01"])
    return meta
