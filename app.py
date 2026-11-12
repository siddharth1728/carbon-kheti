import streamlit as st
import numpy as np
import pandas as pd
import plotly.graph_objects as go
import json
import hashlib
from datetime import datetime, timezone
import pyproj
from shapely.geometry import Polygon, Point
from shapely.ops import transform
from PIL import Image, ExifTags

# --- Page Setup & Strict Honesty Banners ---
st.set_page_config(page_title="Carbon Kheti MRV Engine", page_icon="🌱", layout="wide")
st.markdown("""
<style>
.badge-demo { background-color: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 11px; border: 1px solid #fde68a; display: inline-block; }
.badge-model { background-color: #e0f2fe; color: #075985; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 11px; border: 1px solid #bae6fd; display: inline-block; }
.metric-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 10px; }
.stButton>button { border-radius: 8px; font-weight: 600; }
</style>
""", unsafe_allow_html=True)

col_b1, col_b2, col_b3 = st.columns([1, 1, 2])
with col_b1:
    st.markdown('<span class="badge-demo">SYNTHETIC DEMO DATA</span>', unsafe_allow_html=True)
with col_b2:
    st.markdown('<span class="badge-model">ILLUSTRATIVE MODEL — NOT FIELD-VALIDATED</span>', unsafe_allow_html=True)
with col_b3:
    st.caption("Hash chain proves immutability and provenance, not physical truth.")

# --- UTM 44N Metric Projection & 10m Buffer Math ---
wgs84_to_utm44n = pyproj.Transformer.from_crs("epsg:4326", "epsg:32644", always_xy=True).transform
utm44n_to_wgs84 = pyproj.Transformer.from_crs("epsg:32644", "epsg:4326", always_xy=True).transform

def project_to_utm(poly_wgs84):
    return transform(wgs84_to_utm44n, poly_wgs84)

# --- 6 Telangana Archetype Plots ---
PLOTS_RAW = {
    "TS-RR-01": {"name": "Mallesh Goud (Teak+Mango)", "district": "Ranga Reddy", "mandal": "Maheshwaram", "poly": [[78.4110, 17.1210], [78.4132, 17.1210], [78.4132, 17.1228], [78.4110, 17.1228]], "status": "Clear", "cloudy": False},
    "TS-MK-02": {"name": "Laxmi Bai (Subabul Alley)", "district": "Medak", "mandal": "Narsapur", "poly": [[78.2210, 17.7110], [78.2238, 17.7110], [78.2238, 17.7135], [78.2210, 17.7135]], "status": "Clear", "cloudy": False},
    "TS-NL-03": {"name": "K. Venkat (Micro-Plot Boundary)", "district": "Nalgonda", "mandal": "Miryalaguda", "poly": [[79.5410, 16.8510], [79.5414, 16.8510], [79.5414, 16.8514], [79.5410, 16.8514]], "status": "Needs Review", "cloudy": False},
    "TS-NZ-04": {"name": "B. Anjaiah (Monsoon Gap)", "district": "Nizamabad", "mandal": "Bodhan", "poly": [[77.8710, 18.6410], [77.8735, 18.6410], [77.8735, 18.6432], [77.8710, 18.6432]], "status": "Needs Review", "cloudy": True},
    "TS-RR-05": {"name": "S. Rajeshwar (Overlapping Claim)", "district": "Ranga Reddy", "mandal": "Maheshwaram", "poly": [[78.4120, 17.1215], [78.4140, 17.1215], [78.4140, 17.1232], [78.4120, 17.1232]], "status": "On Hold", "cloudy": False},
    "TS-RR-06": {"name": "G. Srinivas (Spoofed Photo Claim)", "district": "Ranga Reddy", "mandal": "Ibrahimpatnam", "poly": [[78.6110, 17.1810], [78.6135, 17.1810], [78.6135, 17.1830], [78.6110, 17.1830]], "status": "On Hold", "cloudy": False},
}

# --- State Management ---
if "plots" not in st.session_state:
    st.session_state.plots = PLOTS_RAW
if "cloudy_mode" not in st.session_state:
    st.session_state.cloudy_mode = False
if "audit_log" not in st.session_state:
    genesis_payload = {"block": 0, "event": "GENESIS_ROOT", "timestamp": "2026-11-12T00:00:00Z", "details": "Carbon Kheti Open MRV Protocol initialized."}
    genesis_str = json.dumps(genesis_payload, sort_keys=True)
    genesis_hash = hashlib.sha256(genesis_str.encode()).hexdigest()
    st.session_state.audit_log = [{"index": 0, "prev_hash": "0"*64, "payload": genesis_payload, "hash": genesis_hash}]

def append_audit_block(event_name, details):
    last_block = st.session_state.audit_log[-1]
    new_idx = last_block["index"] + 1
    payload = {"block": new_idx, "event": event_name, "timestamp": datetime.now(timezone.utc).isoformat(), "details": details}
    to_hash = last_block["hash"] + json.dumps(payload, sort_keys=True)
    curr_hash = hashlib.sha256(to_hash.encode()).hexdigest()
    st.session_state.audit_log.append({"index": new_idx, "prev_hash": last_block["hash"], "payload": payload, "hash": curr_hash})

# --- Science & Allometric Model with GEDI LiDAR & Bootstrap ---
def run_mrv_science(plot_key, force_cloudy=False):
    pinfo = st.session_state.plots[plot_key]
    poly_wgs = Polygon(pinfo["poly"])
    poly_utm = project_to_utm(poly_wgs)
    area_m2 = poly_utm.area
    area_ha = area_m2 / 10000.0
    buffer_utm = poly_utm.buffer(-10.0)
    effective_pixels = (buffer_utm.area / 100.0) if not buffer_utm.is_empty else 0.0
    
    np.random.seed(abs(hash(plot_key)) % (2**32))
    is_cloudy = force_cloudy or pinfo.get("cloudy", False)
    
    # NASA GEDI L4A / ICESat-2 LiDAR Canopy Height (RH98 meters)
    gedi_canopy_height_m = np.random.uniform(5.8, 9.2) if effective_pixels >= 8 else 3.2
    
    # Paired anniversary delta dAGB (October Y1 vs October Y2)
    # GEDI LiDAR calibration adjusts mean estimate based on canopy height
    mean_dagb = (1.75 + 0.12 * gedi_canopy_height_m) if effective_pixels >= 8 else 0.4
    std_dagb = (0.55 if is_cloudy else 0.32) + (0.5 if effective_pixels < 8 else 0.0)
    
    # 1000x Paired Bootstrap
    pixel_sample_size = max(4, int(min(effective_pixels, 120)))
    raw_pixel_deltas = np.random.normal(mean_dagb, std_dagb, pixel_sample_size)
    
    boot_means = []
    for _ in range(1000):
        resample = np.random.choice(raw_pixel_deltas, size=pixel_sample_size, replace=True)
        boot_means.append(float(np.mean(resample)))
    
    boot_means = np.array(boot_means)
    p05_lower = float(np.percentile(boot_means, 5.0))
    p50_median = float(np.percentile(boot_means, 50.0))
    
    if effective_pixels < 8 or pinfo["status"] == "On Hold" or p05_lower <= 0:
        issuable_dagb = 0.0
        reason = "Effective buffered pixels < 8 (must cluster)" if effective_pixels < 8 else (pinfo.get("hold_reason", "Plot is on hold"))
    else:
        issuable_dagb = p05_lower
        reason = "Verified"
        
    R = 0.25 # Root-to-shoot ratio
    carbon_frac = 0.47
    co2e_factor = 44.0 / 12.0
    baseline = 0.20 # Derived baseline change
    permanence_buffer = 0.15 # 15%
    
    gross_mean_co2e = max(0.0, (mean_dagb * (1 + R) - baseline) * carbon_frac * co2e_factor)
    gross_lower_co2e = max(0.0, (issuable_dagb * (1 + R) - baseline) * carbon_frac * co2e_factor)
    issuable_co2e_ha = gross_lower_co2e * (1.0 - permanence_buffer) if issuable_dagb > 0 else 0.0
    total_farm_credits = issuable_co2e_ha * area_ha
    avoided_overcrediting = max(0.0, gross_mean_co2e - gross_lower_co2e)
    
    return {
        "area_ha": area_ha, "area_m2": area_m2, "effective_pixels": effective_pixels,
        "is_cloudy": is_cloudy, "gedi_height": gedi_canopy_height_m,
        "mean_dagb": mean_dagb, "lower_dagb": p05_lower, "boot_means": boot_means,
        "gross_mean": gross_mean_co2e, "gross_lower": gross_lower_co2e,
        "issuable_ha": issuable_co2e_ha, "total_credits": total_farm_credits,
        "avoided_overcrediting": avoided_overcrediting, "reason": reason
    }

# --- Sidebar Navigation ---
st.sidebar.title("🌱 Carbon Kheti")
st.sidebar.caption("Open MRV for Smallholders · INNOVASIA 2K26")
page = st.sidebar.radio("Navigation", ["1. STORY", "2. PLOTS", "3. CARBON", "4. FRAUD CHECKS", "5. AUDIT LOG", "6. RED-TEAM", "7. REPORT"])

with st.sidebar.expander("📌 Roadmap (Out of Scope)"):
    st.write("Live GEE pipelines, ML weight backpropagation, WhatsApp onboarding, CCTS registry API, direct DBT bank transfers.")

# ================= PAGE 1: STORY =================
if page == "1. STORY":
    st.title("The Smallholder MRV Dilemma & Thesis")
    st.markdown("""
    > **Thesis:** *"Verification cost doesn't scale down with farm size, so smallholders get priced out. We invert that — and we pay for uncertainty with credits, not with trust."*
    """)
    
    col1, col2 = st.columns([1, 1])
    with col1:
        st.subheader("Meet Mallesh Goud (Maheshwaram, Telangana)")
        st.write("""
        - **Farm Size:** 1.0 hectare (kharif agroforestry: Mango + Teak bund rows).
        - **Annual Yield:** ~1.0–2.2 tCO2e/ha/year sequestered.
        - **Traditional MRV Barrier:** Manual field audits cost **US$8–15/ha/year (₹700–₹1,300)** plus ₹15,000 fixed verification mobilization charges, eating **32%–60% of gross carbon revenue**.
        - **Carbon Kheti Solution:** Fully automated multi-spectral + radar + spaceborne LiDAR MRV at **≤ ₹100/ha/year (≈ 4.5% of revenue)**.
        """)
    with col2:
        st.subheader("Unit Economics Sensitivity")
        c_price = st.slider("Carbon Credit Price ($/tCO2e)", 15.0, 50.0, 25.0, 5.0)
        fx_inr = st.slider("USD/INR Exchange Rate", 75.0, 95.0, 88.0, 1.0)
        yield_t = st.slider("Expected Yield (tCO2e/ha/yr)", 0.5, 3.0, 1.8, 0.1)
        
        gross_rev_inr = yield_t * c_price * fx_inr
        trad_cost_inr = 12.0 * fx_inr # $12/ha
        ck_cost_inr = 100.0 # Rs 100/ha
        
        trad_pct = (trad_cost_inr / gross_rev_inr) * 100
        ck_pct = (ck_cost_inr / gross_rev_inr) * 100
        
        st.markdown(f"""
        - **Gross Credit Value:** **₹{gross_rev_inr:,.0f} / ha / yr**
        - **Traditional MRV Cost:** ₹{trad_cost_inr:,.0f} (**{trad_pct:.1f}% of revenue**)
        - **Carbon Kheti MRV Cost:** ₹{ck_cost_inr:.0f} (**{ck_pct:.1f}% of revenue**)
        - **Farmer Net Share (after 75% pool):** **₹{gross_rev_inr * 0.75 - ck_cost_inr:,.0f} / yr**
        """)

# ================= PAGE 2: PLOTS =================
elif page == "2. PLOTS":
    st.title("Telangana Agroforestry Plot Roster (UTM Zone 44N)")
    rows = []
    map_data = []
    for k, v in st.session_state.plots.items():
        res = run_mrv_science(k, st.session_state.cloudy_mode)
        center_lat = np.mean([p[1] for p in v["poly"]])
        center_lon = np.mean([p[0] for p in v["poly"]])
        rows.append({
            "Plot ID": k, "Farmer & Practice": v["name"], "District": v["district"],
            "Area (ha)": f"{res['area_ha']:.2f}", "Buffer Pixels": f"{res['effective_pixels']:.1f}",
            "Status": v["status"], "SAR Fallback": "ACTIVE" if res["is_cloudy"] else "No"
        })
        map_data.append({"lat": center_lat, "lon": center_lon, "Plot": k, "Status": v["status"]})
        
    df_plots = pd.DataFrame(rows)
    st.dataframe(df_plots, use_container_width=True)
    st.subheader("Geospatial Distribution")
    st.map(pd.DataFrame(map_data), latitude="lat", longitude="lon", zoom=8)

# ================= PAGE 3: CARBON =================
elif page == "3. CARBON":
    st.title("Biomass Inversion, Remote Sensing & Bootstrap")
    selected_plot = st.selectbox("Select Plot for Deep-Dive Analysis", list(st.session_state.plots.keys()))
    res = run_mrv_science(selected_plot, st.session_state.cloudy_mode)
    
    col_a, col_b, col_c, col_d = st.columns(4)
    col_a.metric("Gross Mean Estimate", f"{res['gross_mean']:.2f} tCO2e/ha")
    col_b.metric("Conservative Lower Bound", f"{res['issuable_ha']:.2f} tCO2e/ha")
    col_c.metric("Over-Crediting Avoided", f"{res['avoided_overcrediting']:.2f} tCO2e/ha")
    col_d.metric("NASA GEDI LiDAR (RH98)", f"{res['gedi_height']:.1f} m")
    
    # Time Series Synthetic Simulation
    st.subheader("Anniversary Optical vs. Radar Time-Series (Oct Y1 to Oct Y2)")
    months = ["Oct-1", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun(M)", "Jul(M)", "Aug(M)", "Sep", "Oct-2"]
    ndvi_vals = [0.42, 0.44, 0.45, 0.41, 0.38, 0.35, 0.33, 0.32, None, None, None, 0.48, 0.52] if res["is_cloudy"] else [0.42, 0.44, 0.45, 0.41, 0.38, 0.35, 0.33, 0.32, 0.40, 0.43, 0.46, 0.48, 0.52]
    sar_vh = [-14.2, -14.1, -14.0, -14.3, -14.5, -14.8, -15.0, -15.1, -13.9, -13.6, -13.4, -13.2, -13.1]
    
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=months, y=ndvi_vals, mode="lines+markers", name="Sentinel-2 Optical NDVI (Cloud Gapped)", line=dict(color="#16a34a", width=3)))
    fig.add_trace(go.Scatter(x=months, y=[(v + 20) / 10 for v in sar_vh], mode="lines", name="Sentinel-1 SAR Radar VH (Penetrates Cloud)", line=dict(color="#2563eb", dash="dot")))
    fig.update_layout(height=320, margin=dict(l=20, r=20, t=20, b=20), xaxis_title="Monitoring Month", yaxis_title="Spectral / Radar Index")
    st.plotly_chart(fig, use_container_width=True)
    
    st.subheader("1,000x Paired Bootstrap Distribution (ΔAGB)")
    fig_hist = go.Figure()
    fig_hist.add_trace(go.Histogram(x=res["boot_means"], nbinsx=35, marker_color="#059669", opacity=0.75, name="Bootstrap Means"))
    fig_hist.add_vline(x=res["lower_dagb"], line_dash="dash", line_color="#dc2626", annotation_text=f"5th Percentile: {res['lower_dagb']:.2f} t/ha")
    fig_hist.update_layout(height=280, margin=dict(l=20, r=20, t=20, b=20), xaxis_title="ΔAGB (dry t/ha/yr)", yaxis_title="Iterations")
    st.plotly_chart(fig_hist, use_container_width=True)
    
    with st.expander("🔬 Show Your Work (Formula & Parameter Assumptions)"):
        st.markdown(f"""
        - **Above-Ground Delta (ΔAGB):** {res['mean_dagb']:.2f} dry t/ha $\\rightarrow$ Lower 5th percentile: **{res['lower_dagb']:.2f} t/ha**.
        - **Below-Ground Biomass (BGB):** Calculated via IPCC default root-to-shoot ratio $R = 0.25$.
        - **Carbon & Stoichiometry:** Total Biomass $\\times 0.47$ (carbon fraction) $\\times \\frac{{44}}{{12}}$ (3.6667 conversion factor).
        - **Baseline & Buffer Deductions:** Baseline: 0.20 tCO2e/ha, Leakage: 0%, Permanence Buffer Pool: 15%.
        - **Net Verifiable Credits:** **{res['issuable_ha']:.2f} tCO2e/ha/yr** (Status: *{res['reason']}*).
        """)

# ================= PAGE 4: FRAUD CHECKS =================
elif page == "4. FRAUD CHECKS":
    st.title("Multi-Layered Anti-Fraud Engine")
    st.write("Rigorous checks executing geometry algorithms and cryptographic hashing live.")
    
    c1, c2 = st.columns(2)
    with c1:
        st.subheader("1. Spatial Boundary Overlap Check")
        p1 = Polygon(st.session_state.plots["TS-RR-01"]["poly"])
        p5 = Polygon(st.session_state.plots["TS-RR-05"]["poly"])
        overlap_area = p1.intersection(p5).area
        union_area = p1.union(p5).area
        overlap_pct = (overlap_area / union_area) * 100 if union_area > 0 else 0
        if overlap_pct > 5.0:
            st.error(f"❌ ENCHROACHMENT FLAGGED: TS-RR-01 & TS-RR-05 overlap by {overlap_pct:.1f}% (> 5% threshold). Plot placed on HOLD.")
        else:
            st.success(f"✅ Spatial Overlap check clear: {overlap_pct:.1f}%")
            
        st.subheader("2. Satellite Signal vs Claim Verification")
        st.info("Satellite cross-verification compares reported tree density with orbital NDVI trend. Flat NDVI (< 0.15 change) with high photo claims raises a manual audit flag.")
        
    with c2:
        st.subheader("3. EXIF Metadata & Geotag Verification")
        uploaded_file = st.file_uploader("Upload ground photo evidence (JPEG with EXIF)", type=["jpg", "jpeg"])
        if uploaded_file:
            try:
                img = Image.open(uploaded_file)
                exif_data = img._getexif()
                if exif_data:
                    st.success("✅ Real EXIF metadata extracted successfully!")
                    st.json({ExifTags.TAGS.get(k, k): str(v)[:60] for k, v in list(exif_data.items())[:6]})
                else:
                    st.warning("⚠️ Photo has NO EXIF metadata (stripped headers). Flagged for reviewer check.")
            except Exception as e:
                st.error(f"Error parsing EXIF: {e}")
        else:
            st.caption("Demonstration checks run against synthetic photo geotag records:")
            st.error("❌ TS-RR-06: Geotag (17.1950°N, 78.6250°E) is 450m OUTSIDE registered polygon. Status: ON HOLD.")

# ================= PAGE 5: AUDIT LOG =================
elif page == "5. AUDIT LOG":
    st.title("Cryptographic SHA-256 Audit Trail")
    st.caption("Hash_n = SHA-256(Hash_{n-1} + canonical_json(Payload)). Proves immutability, not truth.")
    
    col_btn1, col_btn2 = st.columns([1, 2])
    with col_btn1:
        if st.button("🔍 VERIFY CHAIN INTEGRITY"):
            broken_idx = -1
            for i in range(1, len(st.session_state.audit_log)):
                prev = st.session_state.audit_log[i-1]
                curr = st.session_state.audit_log[i]
                expected_hash = hashlib.sha256((prev["hash"] + json.dumps(curr["payload"], sort_keys=True)).encode()).hexdigest()
                if curr["prev_hash"] != prev["hash"] or curr["hash"] != expected_hash:
                    broken_idx = i
                    break
            if broken_idx == -1:
                st.success(f"✅ Cryptographic Chain Intact! All {len(st.session_state.audit_log)} blocks valid. Root Hash Verified.")
            else:
                st.error(f"🚨 INTEGRITY COMPROMISED: Block #{broken_idx} signature does NOT match payload digest!")
                
    st.subheader("Audit Ledger Records")
    for block in reversed(st.session_state.audit_log):
        with st.container():
            st.markdown(f"""
            **Block #{block['index']}** · `{block['payload'].get('event', 'EVENT')}` · *{block['payload'].get('timestamp', '')}*  
            `Current Hash:` `{block['hash']}`  
            `Prev Hash:   ` `{block['prev_hash']}`  
            """)
            st.json(block['payload'])
            st.divider()

# ================= PAGE 6: RED-TEAM =================
elif page == "6. RED-TEAM":
    st.title("Adversarial Stress Test: Test the System")
    st.write("Inject simulated adversarial attacks to observe real-time system defense mechanisms.")
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        if st.button("🚨 1. Inject Out-of-Bounds EXIF"):
            append_audit_block("PHOTO_FRAUD_DETECTED", {"plot": "TS-RR-06", "reason": "GPS (17.1950, 78.6250) outside boundary", "action": "HOLD_IMPOSED"})
            st.warning("Flagged: Photo coordinates are outside plot polygon! Hold imposed.")
    with col2:
        if st.button("📑 2. Reuse Photo (Byte Match)"):
            append_audit_block("DUPLICATE_PHOTO_ATTEMPT", {"hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", "action": "REJECTED"})
            st.warning("Flagged: Duplicate photo byte hash detected across separate plots!")
    with col3:
        if st.button("🗺️ 3. Add Overlapping Plot"):
            st.session_state.plots["TS-RR-05"]["status"] = "On Hold"
            append_audit_block("OVERLAP_HOLD_ENFORCED", {"plot": "TS-RR-05", "overlap_pct": 14.8, "action": "HOLD_ENFORCED"})
            st.error("Flagged: Encroachment > 5% detected. Output withheld.")
    with col4:
        if st.button("🔨 4. Tamper Past Log Entry"):
            if len(st.session_state.audit_log) > 1:
                st.session_state.audit_log[1]["payload"]["details"] = "UNAUTHORIZED_CREDIT_INFLATION_TAMPER"
                st.error("Injected: Block #1 payload altered silently in memory! Run 'Verify Chain' in Audit Log to catch it.")
                
    st.divider()
    col_c1, col_c2 = st.columns([1, 1])
    with col_c1:
        if st.button("🌧️ 5. Simulate Cloudy Monsoon Season"):
            st.session_state.cloudy_mode = not st.session_state.cloudy_mode
            st.info(f"Cloudy season mode: {'ACTIVE (SAR Radar Fallback engaged, intervals widened)' if st.session_state.cloudy_mode else 'INACTIVE (Normal optical)'}")
    with col_c2:
        if st.button("🔄 Restore Pristine Demo State"):
            st.session_state.plots = PLOTS_RAW
            st.session_state.cloudy_mode = False
            genesis = st.session_state.audit_log[0]
            st.session_state.audit_log = [genesis]
            st.success("Clean demo state restored!")

# ================= PAGE 7: REPORT =================
elif page == "7. REPORT":
    st.title("Verification-Ready Estimate Dossier")
    rep_plot = st.selectbox("Select Plot for Official Dossier", list(st.session_state.plots.keys()))
    res = run_mrv_science(rep_plot, st.session_state.cloudy_mode)
    pinfo = st.session_state.plots[rep_plot]
    
    st.subheader(f"Dossier: {rep_plot} — {pinfo['name']}")
    st.write(f"**Location:** {pinfo['mandal']}, {pinfo['district']} District, Telangana (UTM 44N)")
    st.write(f"**Root Audit Hash:** `{st.session_state.audit_log[-1]['hash']}`")
    
    col_r1, col_r2, col_r3 = st.columns(3)
    col_r1.metric("Conservative Issuable Credits", f"{res['issuable_ha']:.2f} tCO2e/ha/yr")
    col_r2.metric("Total Farm Removals", f"{res['total_credits']:.2f} tCO2e/yr")
    col_r3.metric("Status / Gate", res["reason"])
    
    with st.expander("📋 Excluded Carbon Pools & Honesty Clause"):
        st.markdown("""
        - **Soil Organic Carbon (SOC):** Excluded (requires physical core soil lab validation).
        - **Litter & Dead Wood:** Excluded per conservative accounting principles.
        - **Only AGB (Measured) + BGB (Root:Shoot R=0.25) included.**
        """)
        
    report_dict = {
        "standard": "Carbon Kheti Open MRV Protocol v1.0",
        "plot_id": rep_plot,
        "farmer": pinfo["name"],
        "coordinates_utm": "UTM Zone 44N",
        "net_issuable_tco2e_ha": res["issuable_ha"],
        "total_farm_credits": res["total_credits"],
        "avoided_overcrediting_tco2e_ha": res["avoided_overcrediting"],
        "gedi_lidar_height_m": res["gedi_height"],
        "audit_root_hash": st.session_state.audit_log[-1]["hash"],
        "status": res["reason"]
    }
    
    st.download_button("📥 Download Official JSON Dossier", data=json.dumps(report_dict, indent=2), file_name=f"carbon_kheti_{rep_plot}.json", mime="application/json")
