# backend.py
import math
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import IsolationForest
from prophet import Prophet
from haversine import haversine, Unit
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

app = FastAPI()

origins = [
    "http://localhost:3000",  # React frontend origin
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Starting backend — loading datasets and training models...")

# -----------------------------
# Utility helpers
# -----------------------------
def normalize_location_name(s: str) -> str:
    """Trim, collapse multiple spaces and title-case each word (keeps commas)."""
    if not isinstance(s, str):
        return s
    s = s.strip()
    # collapse whitespace
    s = " ".join(s.split())
    # Title-case words but keep comma spacing
    parts = [p.strip() for p in s.split(",")]
    parts = [" ".join(w.capitalize() for w in p.split(" ")) for p in parts]
    return ", ".join(parts)

def find_best_hotspot_key(query: str, hotspot_keys: list[str]) -> Optional[str]:
    """Try to match query to one of the hotspot keys:
       1) exact (case-insensitive)
       2) hotspot contains query substring
       3) query contains hotspot substring
       returns canonical hotspot key or None.
    """
    if not query:
        return None
    q = query.lower().strip()
    # exact match
    for k in hotspot_keys:
        if k.lower() == q:
            return k
    # hotspot contains query
    for k in hotspot_keys:
        if q in k.lower():
            return k
    # query contains hotspot
    for k in hotspot_keys:
        if k.lower() in q:
            return k
    return None

def safe_number(x):
    """Convert pandas values to JSON-serializable primitives (None if NaN)."""
    if pd.isna(x):
        return None
    if isinstance(x, (int, float)):
        # if float but integer-like, cast to int for beds fields
        if isinstance(x, float) and (abs(x - int(x)) < 1e-9):
            return int(x)
        return x
    return x

# -----------------------------
# Load / train models & datasets
# -----------------------------
try:
    df_symptoms = pd.read_csv("disease_data.csv")
    X_symptoms = df_symptoms.drop("disease", axis=1)
    y_symptoms = df_symptoms["disease"]
    all_symptoms_list = list(X_symptoms.columns)
    symptom_model = DecisionTreeClassifier()
    symptom_model.fit(X_symptoms.values, y_symptoms)
    print("✅ Symptom prediction model trained.")
except Exception as e:
    print("⚠️ Could not train symptom model:", e)
    symptom_model = None
    all_symptoms_list = []

try:
    df_forecast = pd.read_csv("historical_cases.csv")
    df_forecast["ds"] = pd.to_datetime(df_forecast["ds"])
    forecast_model = Prophet()
    forecast_model.fit(df_forecast)
    print("✅ Outbreak forecasting model trained.")
except Exception as e:
    print("⚠️ Could not train forecast model:", e)
    forecast_model = None

try:
    df_anomaly = pd.read_csv("normal_symptoms.csv")
    anomaly_model = IsolationForest(contamination="auto", random_state=42)
    anomaly_model.fit(df_anomaly.values)
    print("✅ Anomaly detection model trained.")
except Exception as e:
    print("⚠️ Could not train anomaly model:", e)
    anomaly_model = None

try:
    df_hospitals = pd.read_csv("hospitals_gurgaon.csv")
    # Normalize column names (in case CSV has slightly different names)
    df_hospitals.columns = [c.strip() for c in df_hospitals.columns]
    print(f"✅ Loaded {len(df_hospitals)} hospitals.")
except Exception as e:
    print("⚠️ Could not load hospitals CSV:", e)
    df_hospitals = pd.DataFrame(columns=["hospital_name", "type", "lat", "lon", "icu_beds_available", "emergency_beds_available", "ambulances_available"])

# Hotspot coordinate map (canonical keys)
hotspot_locations = {
    "Kamrup": (26.14, 91.73),
    "Nagaon": (26.35, 92.68),
    "Jorhat": (26.75, 94.22),
    "Sector 14, Rewari": (28.19, 76.64),
    "Model Town, Rewari": (28.20, 76.62),
    "Delhi": (28.70, 77.10),
    "Dehradun": (30.3165, 78.0322),
}
print("✅ Geospatial mapping for hotspots loaded.")

# -----------------------------
# Pydantic models
# -----------------------------
class SymptomRequest(BaseModel):
    symptoms: list[str]

# -----------------------------
# Endpoints
# -----------------------------
@app.get("/hotspots")
def get_hotspots():
    """Return a deterministic sample count per hotspot so frontend can populate map & alerts.
       (If you have a real source for counts, replace this with that data)
    """
    # create simple deterministic counts so UI can show highlights
    result = {}
    for key in hotspot_locations.keys():
        # deterministic pseudo-count: sum of codepoints % 20
        s = sum(ord(c) for c in key)
        result[key] = int(s % 20)
    return result

@app.post("/predict-disease")
def predict_disease(request: SymptomRequest):
    if symptom_model is None:
        raise HTTPException(status_code=503, detail="Prediction model not available.")
    input_vec = [0] * len(all_symptoms_list)
    for symptom in request.symptoms:
        idx = next((i for i, s in enumerate(all_symptoms_list) if s.lower() == symptom.lower()), None)
        if idx is not None:
            input_vec[idx] = 1
    prediction = symptom_model.predict([input_vec])
    return {"predicted_disease": prediction[0]}

@app.get("/forecast-outbreak")
def forecast_outbreak():
    if forecast_model is None:
        raise HTTPException(status_code=503, detail="Forecast model not available.")
    future = forecast_model.make_future_dataframe(periods=7)
    forecast = forecast_model.predict(future)
    forecast_data = forecast[["ds", "yhat"]].tail(7)
    forecast_data["ds"] = forecast_data["ds"].dt.strftime("%Y-%m-%d")
    return {"forecast": forecast_data.to_dict("records")}

@app.post("/check-anomaly")
def check_anomaly(request: SymptomRequest):
    if anomaly_model is None:
        raise HTTPException(status_code=503, detail="Anomaly model not available.")
    input_vec = [0] * len(all_symptoms_list)
    for symptom in request.symptoms:
        idx = next((i for i, s in enumerate(all_symptoms_list) if s.lower() == symptom.lower()), None)
        if idx is not None:
            input_vec[idx] = 1
    pred = anomaly_model.predict([input_vec])
    return {"is_anomaly": int(pred[0] == -1)}

@app.get("/iot-water-data/{location}")
def get_water_data(location: str):
    """Return simulated water metrics for given location. Accepts flexible location names."""
    if not location:
        raise HTTPException(status_code=400, detail="Location required.")

    norm = normalize_location_name(location)
    matched = find_best_hotspot_key(norm, list(hotspot_locations.keys()))

    if matched:
        loc_key = matched
    else:
        # do not fail immediately — still attempt to respond using normalized name
        loc_key = norm

    # produce deterministic variations so different locations show slightly different metrics
    base_ph = 7.2
    base_turb = 3.5
    base_cont = 15.0
    # small deterministic offset from name
    offset_val = sum(ord(c) for c in loc_key) % 7  # 0..6
    ph = round(base_ph + ((offset_val - 3) * 0.05), 2)               # roughly 6.85..7.55
    turb = round(max(0.5, base_turb + ((offset_val - 3) * 0.2)), 2)  # roughly 2.9..4.7
    cont = round(max(0, base_cont + ((offset_val - 3) * 1.5)), 2)     # roughly 10..24

    return {"location": loc_key, "pH": ph, "Turbidity": turb, "Contaminants": cont}

@app.get("/hospitals-near-hotspot/{location_name}")
def get_hospitals_near_hotspot(location_name: str):
    if not location_name:
        raise HTTPException(status_code=400, detail="Location name required.")

    norm = normalize_location_name(location_name)
    matched = find_best_hotspot_key(norm, list(hotspot_locations.keys()))

    if matched is None:
        # return 404 with helpful message
        raise HTTPException(status_code=404, detail=f"Location '{location_name}' not recognized. Try one of: {', '.join(hotspot_locations.keys())}")

    hotspot_coords = hotspot_locations[matched]
    SEARCH_RADIUS_KM = 50  # Increased radius for broader search

    # Compute distances (safe copy)
    df = df_hospitals.copy()
    if "lat" not in df.columns or "lon" not in df.columns:
        raise HTTPException(status_code=500, detail="Hospitals dataset missing lat/lon columns.")

    try:
        df["distance"] = df.apply(
            lambda row: haversine((float(row["lat"]), float(row["lon"])), hotspot_coords, unit=Unit.KILOMETERS),
            axis=1,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error computing distances: {e}")

    nearby = df[df["distance"] <= SEARCH_RADIUS_KM].sort_values("distance")

    if nearby.empty:
        # Return 404 to indicate none found (frontend will treat as no hospitals)
        raise HTTPException(status_code=404, detail=f"No hospitals within {SEARCH_RADIUS_KM} km of {matched}.")

    # Build JSON-safe records
    records = []
    fields = ["hospital_name", "type", "distance", "icu_beds_available", "emergency_beds_available", "ambulances_available"]
    for _, row in nearby.iterrows():
        rec = {
            "hospital_name": safe_number(row.get("hospital_name")) or row.get("hospital_name") or "Unknown",
            "type": safe_number(row.get("type")) or row.get("type") or "Unknown",
            "distance": float(row.get("distance")) if not pd.isna(row.get("distance")) else None,
            "icu_beds_available": safe_number(row.get("icu_beds_available")),
            "emergency_beds_available": safe_number(row.get("emergency_beds_available")),
            "ambulances_available": safe_number(row.get("ambulances_available")),
        }
        records.append(rec)

    return {"location": matched, "count": len(records), "hospitals": records}
