from fastapi import APIRouter
from typing import List, Dict, Any
from ..database import db

router = APIRouter(prefix="/audit", tags=["Audit Chain"])

@router.get("/chain")
async def get_audit_chain() -> List[Dict[str, Any]]:
    return db.audit_chain

@router.get("/verify")
async def verify_chain() -> Dict[str, Any]:
    return db.verify_chain()

@router.post("/tamper")
async def tamper_record(index: int = 0):
    if len(db.audit_chain) > index:
        target = db.audit_chain[index]
        target["details"] = {
            **target.get("details", {}),
            "unauthorizedInjectedCredits": 99999.0,
            "tamperNotice": "Payload modified in backend memory without re-signing"
        }
        return {"success": True, "message": f"Block #{index} payload modified. Run /verify to observe broken chain."}
    return {"success": False, "message": "Index out of range."}
