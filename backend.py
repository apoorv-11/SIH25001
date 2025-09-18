# --- robust hospitals loading (replace your current df_hospitals load snippet) ---
import logging

logger = logging.getLogger("uvicorn.error")

try:
    df_hospitals = pd.read_csv("hospitals_gurgaon.csv")
    # Normalize column names
    df_hospitals.columns = [c.strip() for c in df_hospitals.columns]

    # Ensure expected columns exist. If not, log and create safe defaults.
    expected = ["hospital_name", "type", "lat", "lon", "icu_beds_available", "emergency_beds_available", "ambulances_available"]
    for col in expected:
        if col not in df_hospitals.columns:
            logger.warning("Hospitals CSV missing column '%s' — creating placeholder column.", col)
            df_hospitals[col] = pd.NA

    # Coerce numeric columns safely (lat/lon & beds)
    df_hospitals["lat"] = pd.to_numeric(df_hospitals["lat"], errors="coerce")
    df_hospitals["lon"] = pd.to_numeric(df_hospitals["lon"], errors="coerce")
    df_hospitals["icu_beds_available"] = pd.to_numeric(df_hospitals["icu_beds_available"], errors="coerce")
    df_hospitals["emergency_beds_available"] = pd.to_numeric(df_hospitals["emergency_beds_available"], errors="coerce")
    df_hospitals["ambulances_available"] = pd.to_numeric(df_hospitals["ambulances_available"], errors="coerce")

    # Drop rows missing valid coordinates (can't compute distance)
    before = len(df_hospitals)
    df_hospitals = df_hospitals.dropna(subset=["lat", "lon"]).reset_index(drop=True)
    after = len(df_hospitals)
    logger.info("Loaded hospitals: %d (dropped %d rows missing coordinates)", after, before - after)
except Exception as e:
    logger.exception("Failed to load hospitals CSV: %s", e)
    # create empty fallback DataFrame with expected columns
    df_hospitals = pd.DataFrame(columns=expected)

# --- safe hospitals endpoint (replace your existing endpoint) ---
from fastapi import HTTPException

@app.get("/hospitals-near-hotspot/{location_name}")
def get_hospitals_near_hotspot(location_name: str):
    if not location_name:
        raise HTTPException(status_code=400, detail="Location name required.")

    try:
        norm = normalize_location_name(location_name)
        matched = find_best_hotspot_key(norm, list(hotspot_locations.keys()))
        if matched is None:
            raise HTTPException(status_code=404, detail=f"Location '{location_name}' not recognized. Try: {', '.join(hotspot_locations.keys())}")

        hotspot_coords = hotspot_locations[matched]
        SEARCH_RADIUS_KM = 50

        if df_hospitals.empty:
            raise HTTPException(status_code=500, detail="Hospitals dataset is empty or failed to load.")

        # Compute distances with defensive conversion
        def compute_distance_safe(row):
            try:
                lat = float(row["lat"])
                lon = float(row["lon"])
                return haversine((lat, lon), hotspot_coords, unit=Unit.KILOMETERS)
            except Exception as e:
                # Log the bad row and skip it by returning NaN
                logger.warning("Skipping hospital row due to invalid coords or error: %s -- row: %s", e, row.to_dict())
                return float("nan")

        df = df_hospitals.copy()
        df["distance"] = df.apply(compute_distance_safe, axis=1)

        nearby = df[df["distance"].notna() & (df["distance"] <= SEARCH_RADIUS_KM)].sort_values("distance")
        if nearby.empty:
            # 404 indicates no hospitals found within radius
            raise HTTPException(status_code=404, detail=f"No hospitals within {SEARCH_RADIUS_KM} km of {matched}.")

        # Build JSON-safe records
        records = []
        for _, row in nearby.iterrows():
            records.append({
                "hospital_name": str(row.get("hospital_name") or "Unknown"),
                "type": str(row.get("type") or "Unknown"),
                "distance": float(row["distance"]) if not pd.isna(row["distance"]) else None,
                "icu_beds_available": None if pd.isna(row.get("icu_beds_available")) else int(row.get("icu_beds_available")),
                "emergency_beds_available": None if pd.isna(row.get("emergency_beds_available")) else int(row.get("emergency_beds_available")),
                "ambulances_available": None if pd.isna(row.get("ambulances_available")) else int(row.get("ambulances_available")),
            })

        return {"location": matched, "count": len(records), "hospitals": records}

    except HTTPException:
        # Re-raise known HTTP exceptions unchanged
        raise
    except Exception as e:
        # Unexpected server error — log full traceback to uvicorn console and return 500 with the message (safe for dev)
        logger.exception("Unhandled error in /hospitals-near-hotspot for '%s': %s", location_name, e)
        raise HTTPException(status_code=500, detail=f"Server error while processing hospitals for '{location_name}': {str(e)}")
