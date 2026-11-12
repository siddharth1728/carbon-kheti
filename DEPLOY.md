# Carbon Kheti Deployment Guide
**Team DoSA • INNOVASIA 2K26 (PS-13)**

Carbon Kheti is architected as **two independently deployable deliverables** plus one hybrid client:
1. **FastAPI Backend Service** (`backend/`)
2. **React + Vite Frontend Web/PWA** (`src/`, `dist/`)
3. **Android Client** (`android/`, Capacitor)

---

## 1. Backend Service Deployment (FastAPI)

### Local Development / Demo Run
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Endpoints:
- API Root: `http://localhost:8000/api/v1`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`
- Health Probe: `http://localhost:8000/health`
- Readiness Probe: `http://localhost:8000/ready`

### Docker Container Deployment
```bash
docker build -t carbon-kheti-backend:v1.0 ./backend
docker run -d -p 8000:8000 --name ck-backend carbon-kheti-backend:v1.0
```

### Free Cloud Deployment (Render / Fly.io / Railway / Koyeb)
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Health Check Path**: `/health`

*Note on Cold Starts:* If hosted on free tiers that sleep (Render/Fly.io), the mobile app features built-in cold-start detection: it automatically displays *"Connecting to server / Backend waking up... Stand by"* with 3-attempt exponential backoff instead of failing.

---

## 2. Frontend Web & PWA Deployment

### Local Production Preview
```bash
npm run build
npm run preview -- --host 0.0.0.0 --port 4173
```

### Static Hosting (Vercel / Cloudflare Pages / Netlify / GitHub Pages)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_BASE_URL`: URL of your deployed FastAPI backend (e.g. `https://api.carbonkheti.dosa.in`).

---

## 3. Android APK Release Signing

To generate a production signed APK:

1. **Generate a Keystore** (run once):
   ```bash
   keytool -genkey -v -keystore release.keystore -alias carbonkheti -keyalg RSA -keysize 2048 -validity 10000
   ```
2. **Configure Gradle Signing** in `android/app/build.gradle` or sign with `jarsigner`:
   ```bash
   jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore release.keystore android/app/build/outputs/apk/release/app-release-unsigned.apk carbonkheti
   zipalign -v 4 android/app/build/outputs/apk/release/app-release-unsigned.apk CarbonKheti-Release.apk
   ```

---

## 4. Environment Variables Reference

| Variable | Scope | Default | Description |
|---|---|---|---|
| `PROJECT_NAME` | Backend | `Carbon Kheti MRV API` | Service title in OpenAPI |
| `SECRET_KEY` | Backend | *(Demo Secret)* | HMAC-SHA256 JWT signing secret |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Backend | `60` | Short-lived token duration |
| `MAX_LOGIN_ATTEMPTS` | Backend | `5` | Lockout threshold for typos |
| `LOCKOUT_DURATION_SECONDS` | Backend | `900` | Account lock duration |
| `MIN_SUPPORTED_APP_VERSION` | Backend | `1.0.0` | Minimum client version |
| `VITE_API_BASE_URL` | Frontend | `http://127.0.0.1:8000` | Gateway URL |
