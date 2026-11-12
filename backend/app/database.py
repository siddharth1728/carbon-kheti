import os
import time
import json
import hashlib
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
from .security import hash_password

def canonical_json(data: Any) -> str:
    return json.dumps(data, sort_keys=True, separators=(',', ':'))

def compute_record_hash(prev_hash: str, record_data: Dict[str, Any]) -> str:
    canonical_payload = canonical_json({
        "timestamp": record_data["timestamp"],
        "action": record_data["action"],
        "actor": record_data["actor"],
        "details": record_data["details"],
    })
    return hashlib.sha256((prev_hash + canonical_payload).encode('utf-8')).hexdigest()

class InMemoryDatabase:
    def __init__(self):
        self.start_time = time.time()
        self.request_logs: List[Dict[str, Any]] = []
        self.idempotency_cache: Dict[str, Any] = {}
        self.refresh_tokens: Dict[str, Dict[str, Any]] = {}  # jti -> {family, user_id, revoked}
        self.revoked_families: set = set()
        
        # Seed Accounts
        self.users: Dict[str, Dict[str, Any]] = {
            "+919849012345": {
                "userId": "user_farmer_01",
                "phone": "+919849012345",
                "name": "Mallesh Goud (Farmer)",
                "role": "farmer",
                "passwordHash": hash_password(os.getenv("SEED_FARMER_PASSWORD", "Farmer@2026")),
                "allowedPlotIds": ["TS-RR-01"],
            },
            "+919848011223": {
                "userId": "user_verifier_01",
                "phone": "+919848011223",
                "name": "Anil Kumar (FPO Lead / Verifier)",
                "role": "verifier",
                "passwordHash": hash_password(os.getenv("SEED_VERIFIER_PASSWORD", "Verifier@2026")),
                "allowedPlotIds": ["*"],
            },
            "+919847099887": {
                "userId": "user_buyer_01",
                "phone": "+919847099887",
                "name": "Priya Sharma (Corporate Buyer)",
                "role": "buyer",
                "passwordHash": hash_password(os.getenv("SEED_BUYER_PASSWORD", "Buyer@2026")),
                "allowedPlotIds": ["*"],
            },
            "+919999999999": {
                "userId": "user_admin_01",
                "phone": "+919999999999",
                "name": "Platform Administrator",
                "role": "admin",
                "passwordHash": hash_password(os.getenv("SEED_ADMIN_PASSWORD", "Admin@2026")),
                "allowedPlotIds": ["*"],
            }
        }

        # Seed Genesis Block for Audit Chain
        self.audit_chain: List[Dict[str, Any]] = []
        self._init_genesis()

        # Seed Telangana Plots
        self.plots: Dict[str, Dict[str, Any]] = self._init_plots()

    def _init_genesis(self):
        genesis_prev = "0" * 64
        genesis_data = {
            "index": 0,
            "timestamp": "2026-11-12T08:00:00.000Z",
            "action": "GENESIS_INIT",
            "actor": "SYSTEM_KERNEL",
            "details": {
                "standard": "Carbon Kheti Open MRV Protocol v1.0",
                "region": "Telangana, India (UTM Zones 43N & 44N)",
                "methodology": "Paired anniversary bootstrap dAGB (IPCC Tier-2)",
                "honestyRule": "Cryptographic hash chain proves immutability and sequence, not physical truth",
                "sensorSuites": ["Sentinel-2 MSI (10m)", "Sentinel-1 SAR C-band (VH)", "GEDI / ICESat-2 LiDAR"]
            },
            "prevHash": genesis_prev,
            "currentHash": "1030ec7633ac4a12f5a1491c6a04d6874850a9372d39cd3e612c39deef46adc0"
        }
        self.audit_chain = [genesis_data]

    def _init_plots(self) -> Dict[str, Dict[str, Any]]:
        return {
            "TS-RR-01": {
                "id": "TS-RR-01",
                "name": "Plot 1: Rangareddy Teak-Mango (Clean)",
                "farmerName": "Mallesh Goud",
                "district": "Ranga Reddy",
                "state": "Telangana",
                "utmZone": 44,
                "areaHa": 1.25,
                "lat": 17.1235,
                "lon": 78.4124,
                "status": "active",
                "grossMeanCo2ePerHa": 4.31,
                "finalCreditsPerHa": 1.76,
                "totalIssuableCo2e": 2.20,
            },
            "TS-SDP-02": {
                "id": "TS-SDP-02",
                "name": "Plot 2: Siddipet Red-Gram Agroforestry (Clean)",
                "farmerName": "Lakshmi Bai",
                "district": "Siddipet",
                "state": "Telangana",
                "utmZone": 44,
                "areaHa": 0.85,
                "lat": 18.1012,
                "lon": 78.8523,
                "status": "active",
                "grossMeanCo2ePerHa": 3.82,
                "finalCreditsPerHa": 1.45,
                "totalIssuableCo2e": 1.23,
            },
            "TS-MBNR-03": {
                "id": "TS-MBNR-03",
                "name": "Plot 3: Mahabubnagar Smallholder (Wide Uncertainty)",
                "farmerName": "K. Venkat Rao",
                "district": "Mahabubnagar",
                "state": "Telangana",
                "utmZone": 43,
                "areaHa": 0.42,
                "lat": 16.7456,
                "lon": 77.9856,
                "status": "active",
                "grossMeanCo2ePerHa": 3.40,
                "finalCreditsPerHa": 0.95,
                "totalIssuableCo2e": 0.40,
            },
            "TS-KMM-04": {
                "id": "TS-KMM-04",
                "name": "Plot 4: Khammam Cloud-Gapped (Radar Fallback)",
                "farmerName": "Srinivas Reddy",
                "district": "Khammam",
                "state": "Telangana",
                "utmZone": 44,
                "areaHa": 1.50,
                "lat": 17.2472,
                "lon": 80.1514,
                "status": "active",
                "grossMeanCo2ePerHa": 4.10,
                "finalCreditsPerHa": 1.15,
                "totalIssuableCo2e": 1.73,
            },
            "TS-NZB-05": {
                "id": "TS-NZB-05",
                "name": "Plot 5: Nizamabad Border Conflict (Boundary Hold)",
                "farmerName": "Ramesh Chary",
                "district": "Nizamabad",
                "state": "Telangana",
                "utmZone": 43,
                "areaHa": 1.10,
                "lat": 18.6725,
                "lon": 78.0941,
                "status": "on_hold",
                "holdReason": "Cadastral overlap: 8.4% intersection with TS-NZB-06 (Threshold: 5.0%)",
                "grossMeanCo2ePerHa": 3.90,
                "finalCreditsPerHa": 0.00,
                "totalIssuableCo2e": 0.00,
            },
            "TS-RR-06": {
                "id": "TS-RR-06",
                "name": "Plot 6: Shamshabad Drone Anomaly (Fraud Hold)",
                "farmerName": "B. Narayana",
                "district": "Ranga Reddy",
                "state": "Telangana",
                "utmZone": 44,
                "areaHa": 1.80,
                "lat": 17.2514,
                "lon": 78.4328,
                "status": "on_hold",
                "holdReason": "Evidence mismatch: Ground photo GPS coordinates located 42m outside boundary polygon.",
                "grossMeanCo2ePerHa": 4.50,
                "finalCreditsPerHa": 0.00,
                "totalIssuableCo2e": 0.00,
            }
        }

    def append_audit_record(self, action: str, actor: str, details: Dict[str, Any]) -> Dict[str, Any]:
        prev = self.audit_chain[-1]
        next_idx = prev["index"] + 1
        timestamp = datetime.now(timezone.utc).isoformat()
        record_data = {
            "index": next_idx,
            "timestamp": timestamp,
            "action": action,
            "actor": actor,
            "details": details
        }
        current_hash = compute_record_hash(prev["currentHash"], record_data)
        record = {
            **record_data,
            "prevHash": prev["currentHash"],
            "currentHash": current_hash
        }
        self.audit_chain.append(record)
        return record

    def verify_chain(self) -> Dict[str, Any]:
        if not self.audit_chain:
            return {"valid": False, "brokenIdx": 0, "totalChecked": 0, "recomputedRootHash": ""}
        
        genesis = self.audit_chain[0]
        if genesis["index"] != 0 or genesis["prevHash"] != "0" * 64:
            return {"valid": False, "brokenIdx": 0, "totalChecked": 1, "recomputedRootHash": ""}
        
        expected_gen_hash = compute_record_hash("0" * 64, genesis)
        if genesis["currentHash"] != expected_gen_hash:
            return {"valid": False, "brokenIdx": 0, "totalChecked": 1, "recomputedRootHash": expected_gen_hash}

        for i in range(1, len(self.audit_chain)):
            prev = self.audit_chain[i - 1]
            curr = self.audit_chain[i]

            if curr["index"] != i:
                return {"valid": False, "brokenIdx": i, "totalChecked": i + 1, "recomputedRootHash": ""}
            if curr["prevHash"] != prev["currentHash"]:
                return {"valid": False, "brokenIdx": i, "totalChecked": i + 1, "recomputedRootHash": ""}

            expected_h = compute_record_hash(prev["currentHash"], curr)
            if curr["currentHash"] != expected_h:
                return {"valid": False, "brokenIdx": i, "totalChecked": i + 1, "recomputedRootHash": expected_h}

        return {
            "valid": True,
            "brokenIdx": -1,
            "totalChecked": len(self.audit_chain),
            "recomputedRootHash": self.audit_chain[-1]["currentHash"],
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    def log_request(self, method: str, path: str, status_code: int, client_ip: str, client_type: str, duration_ms: float):
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "method": method,
            "path": path,
            "statusCode": status_code,
            "clientIp": client_ip,
            "clientType": client_type,
            "durationMs": round(duration_ms, 2)
        }
        self.request_logs.append(entry)
        if len(self.request_logs) > 100:
            self.request_logs.pop(0)

    def reset_demo_state(self):
        self._init_genesis()
        self.plots = self._init_plots()
        self.refresh_tokens.clear()
        self.revoked_families.clear()
        self.idempotency_cache.clear()

db = InMemoryDatabase()
