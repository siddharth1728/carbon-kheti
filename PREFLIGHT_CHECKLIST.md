# Pre-Flight Presentation Checklist (2 Minutes Before Stage)
**Team DoSA • INNOVASIA 2K26 (PS-13)**

Complete this checklist 2 minutes before stepping up to the judges' table:

---

## 1. Laptop & Screen Projection
- [ ] Laptop charger plugged in.
- [ ] Display resolution set to 1920x1080 (16:9) for optimal projector rendering.
- [ ] Browser window open to `http://localhost:4173` (or `http://localhost:5173`).
- [ ] In Verifier Console, verify Tab 9 (**FastAPI Backend Console**) displays a green **HEALTHY** badge.
- [ ] If mirroring phone: `scrcpy --max-size 1080` is running in an open terminal.

---

## 2. Phone Status
- [ ] Battery >= 30% (or connected to laptop USB).
- [ ] Screen Wake Lock / Screen Timeout set to >= 10 minutes.
- [ ] Do Not Disturb (DND) enabled on phone to suppress personal notifications during demo.
- [ ] Location / GPS toggle turned ON in quick settings.

---

## 3. Network & Gateway
- [ ] If using laptop backend: USB reverse port is active:
  ```bash
  adb reverse tcp:8000 tcp:8000
  ```
- [ ] If using Wi-Fi: Tap **Pre-Flight** in the top navbar and ensure all 7 indicators show green/yellow checkmarks.

---

## 4. Emergency Fallback Readiness
- [ ] Standalone Python verification script is ready:
  ```bash
  python verify.py
  ```
- [ ] In-app **Chaos Panel** (top bar "Chaos" button) is closed and in standard mode.
- [ ] Admin unlock phone number is memorized: `+919849012345`.
