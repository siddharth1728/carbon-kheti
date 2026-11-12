import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import db
from app.limiter import limiter

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_and_teardown():
    db.reset_demo_state()
    limiter._records.clear()
    yield

def test_health_and_readiness():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["version"] == "1.0.0"

    res_ready = client.get("/ready")
    assert res_ready.status_code == 200
    assert res_ready.json()["status"] == "ready"
    assert res_ready.json()["auditChainValid"] is True

def test_app_version_enforcement():
    # Below minimum supported version -> 426
    res = client.get("/api/v1/audit/chain", headers={"X-App-Version": "0.8.5"})
    assert res.status_code == 426
    assert res.json()["error"] == "UPDATE_REQUIRED"

    # Supported version -> 200
    res_ok = client.get("/api/v1/audit/chain", headers={"X-App-Version": "1.0.0"})
    assert res_ok.status_code == 200

def test_login_and_mobile_tokens():
    # Login with raw 10-digit number (auto-normalized to E.164 +91)
    res = client.post(
        "/api/v1/auth/login",
        json={"phone": "9849012345", "password": "Farmer@2026"},
        headers={"X-Client": "mobile"}
    )
    assert res.status_code == 200
    data = res.json()
    assert "accessToken" in data
    assert "refreshToken" in data
    assert data["user"]["phone"] == "+919849012345"
    assert data["user"]["role"] == "farmer"

def test_rate_limiting_and_admin_unlock():
    phone = "9849012345"
    # Attempt 5 wrong passwords
    for i in range(5):
        res = client.post("/api/v1/auth/login", json={"phone": phone, "password": "WrongPassword!"})
        if i < 4:
            assert res.status_code == 401
        else:
            assert res.status_code == 429
            assert "Retry-After" in res.headers

    # 6th attempt is locked
    res_locked = client.post("/api/v1/auth/login", json={"phone": phone, "password": "Farmer@2026"})
    assert res_locked.status_code == 429

    # Admin unlocks account
    admin_login = client.post("/api/v1/auth/login", json={"phone": "+919999999999", "password": "Admin@2026"})
    admin_token = admin_login.json()["accessToken"]

    unlock_res = client.post(
        "/api/v1/admin/unlock-account",
        json={"phone": "+919849012345"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert unlock_res.status_code == 200
    assert unlock_res.json()["success"] is True

    # Now login succeeds immediately!
    res_success = client.post("/api/v1/auth/login", json={"phone": phone, "password": "Farmer@2026"})
    assert res_success.status_code == 200

def test_refresh_token_rotation_and_reuse_detection():
    # 1. Login
    res = client.post("/api/v1/auth/login", json={"phone": "+919849012345", "password": "Farmer@2026"})
    ref_token_1 = res.json()["refreshToken"]

    # 2. Refresh tokens
    ref_res_1 = client.post("/api/v1/auth/refresh", json={"refreshToken": ref_token_1})
    assert ref_res_1.status_code == 200
    ref_token_2 = ref_res_1.json()["refreshToken"]
    assert ref_token_1 != ref_token_2

    # 3. Attempt reuse of ref_token_1 -> Should detect attack and revoke family!
    reuse_res = client.post("/api/v1/auth/refresh", json={"refreshToken": ref_token_1})
    assert reuse_res.status_code == 401
    assert "revoked" in reuse_res.json()["detail"].lower()

def test_rbac_tenant_isolation():
    # Farmer login
    farmer_res = client.post("/api/v1/auth/login", json={"phone": "+919849012345", "password": "Farmer@2026"})
    farmer_token = farmer_res.json()["accessToken"]

    # Farmer accesses own plot TS-RR-01 -> 200
    own_plot = client.get("/api/v1/plots/TS-RR-01", headers={"Authorization": f"Bearer {farmer_token}"})
    assert own_plot.status_code == 200

    # Farmer attempts to access another farmer's plot TS-SDP-02 -> 403 Forbidden!
    other_plot = client.get("/api/v1/plots/TS-SDP-02", headers={"Authorization": f"Bearer {farmer_token}"})
    assert other_plot.status_code == 403

def test_cryptographic_audit_chain_and_tamper_detection():
    # 1. Verify pristine chain
    verify_1 = client.get("/api/v1/audit/verify")
    assert verify_1.status_code == 200
    assert verify_1.json()["valid"] is True
    assert verify_1.json()["brokenIdx"] == -1

    # 2. Tamper block 0 payload in memory
    tamper_res = client.post("/api/v1/audit/tamper?index=0")
    assert tamper_res.status_code == 200

    # 3. Verify detects broken chain
    verify_tampered = client.get("/api/v1/audit/verify")
    assert verify_tampered.status_code == 200
    assert verify_tampered.json()["valid"] is False
    assert verify_tampered.json()["brokenIdx"] == 0

def test_idempotent_plot_registration():
    farmer_res = client.post("/api/v1/auth/login", json={"phone": "+919849012345", "password": "Farmer@2026"})
    token = farmer_res.json()["accessToken"]

    payload = {
        "farmerName": "Mallesh Goud",
        "phone": "+919849012345",
        "passbookNo": "TEL-RR-8877",
        "coordinates": [
            [78.4124, 17.1235],
            [78.4134, 17.1235],
            [78.4134, 17.1245],
            [78.4124, 17.1245],
            [78.4124, 17.1235]
        ]
    }

    # 1st Submission with Idempotency Key
    res_1 = client.post(
        "/api/v1/plots/register",
        json=payload,
        headers={"Authorization": f"Bearer {token}", "X-Idempotency-Key": "idemp_test_key_123"}
    )
    assert res_1.status_code == 200
    plot_id_1 = res_1.json()["plot"]["id"]

    # 2nd Submission with SAME Idempotency Key -> returns exact same plot ID without duplicating
    res_2 = client.post(
        "/api/v1/plots/register",
        json=payload,
        headers={"Authorization": f"Bearer {token}", "X-Idempotency-Key": "idemp_test_key_123"}
    )
    assert res_2.status_code == 200
    assert res_2.json()["plot"]["id"] == plot_id_1
