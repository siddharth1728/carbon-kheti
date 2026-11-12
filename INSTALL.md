# Carbon Kheti Android APK Installation & Live Demo Guide
**Team DoSA • INNOVASIA 2K26 (PS-13)**

This guide explains how to install and run the **Carbon Kheti Farmer App** on any physical Android smartphone (or emulator) for a judge-proof live demonstration.

---

## 1. Quick Install via ADB (Recommended for Presenters)

If your phone is connected to your laptop via USB with **USB Debugging** enabled:

```bash
# 1. Verify device is recognized
adb devices

# 2. Reverse port 8000 so the phone accesses your local laptop backend directly over USB
adb reverse tcp:8000 tcp:8000

# 3. Install the APK
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 2. Direct Sideloading on Phone (No Laptop Required)

1. **Download the APK** from the GitHub Actions Artifact or transfer `app-debug.apk` to your phone via USB / Google Drive / WhatsApp.
2. Tap the APK file in **Files** / **Downloads**.
3. **Allow Installation from Unknown Sources**:
   - If prompted: *“For your security, your phone is not allowed to install unknown apps from this source.”*
   - Tap **Settings** -> Toggle **Allow from this source** -> Tap **Back** -> Tap **Install**.
4. **Google Play Protect Prompt**:
   - Tap **More details** -> Tap **Install anyway** (standard for unsigned development APKs).
5. Open **Carbon Kheti** from your app drawer.

---

## 3. Connecting the Phone App to your Backend

The app is built to handle both **Local Development** and **Remote Production** backends without needing to rebuild the APK.

### Option A: USB Tether / Port Reverse (Zero Venue Wi-Fi Dependence)
Run on your laptop:
```bash
adb reverse tcp:8000 tcp:8000
```
In the app, the default `http://127.0.0.1:8000` or `http://localhost:8000` will route directly to your laptop backend over the USB cable!

### Option B: Local Wi-Fi / Hotspot
1. Turn on your laptop Wi-Fi hotspot and connect your phone.
2. Find your laptop IP:
   ```powershell
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.137.1)
   ```
3. In the Carbon Kheti app:
   - Tap the **Carbon Kheti** logo in the top bar **5 times** (or tap the **Server** icon in the bar).
   - Enter your laptop URL: `http://192.168.137.1:8000`.
   - Tap **Test Connection** -> Verify green response (`200 OK`) -> Tap **Save & Apply**.

### Option C: Complete Offline Fallback
If venue network is completely dead and backend is unreachable:
- The app automatically uses its **bundled offline demo snapshot** (`src/data/demoSnapshot.json`).
- All plots, calculations, Sentinel viewers, and audit verifications work 100% offline!

---

## 4. Presenting: Projecting Phone Screen to Laptop

To project your live phone screen on the projector screen for the judges:

### Using `scrcpy` (Best, Ultra-Low Latency):
```bash
# Launch high-framerate mirror
scrcpy --max-size 1080 --stay-awake
```
*Tip:* Add `--show-touches` to show your finger taps on the screen during the presentation.

---

## 5. Backup Plan: Install as Progressive Web App (PWA)

If a judge wants to open the app on their own phone without installing an APK:
1. Open Chrome on the phone.
2. Navigate to your deployed URL (e.g. `https://carbon-kheti.web.app` or `http://<laptop-ip>:4173`).
3. Tap Chrome's three dots (`⋮`) -> Tap **Add to Home screen** / **Install app**.
4. The app installs as a standalone fullscreen app with offline service-worker caching!
