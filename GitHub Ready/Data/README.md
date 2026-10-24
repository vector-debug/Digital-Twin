# GlycoTwin India — Exported Synthetic Demo Data

All data here is **100% synthetic**. It contains no real patient information and
is for prototype/demo use only. It is **not clinically validated** and must not
be used for diagnosis or treatment decisions.

## Files

| File | Description |
|---|---|
| `patients.json` | Static EHR records for the 3 virtual patients. Medication lists remain structured. |
| `patients.csv` | Same EHR records flattened to one row per patient; medications joined into one string. |
| `all_patients_telemetry.csv` | Combined 5-minute wearable telemetry for all patients. |
| `all_patients_telemetry.json` | Same combined telemetry as an array of JSON records. |
| `<patient_id>_telemetry.csv` | Per-patient telemetry (289 rows each). |
| `<patient_id>_telemetry.json` | Per-patient telemetry as JSON records. |
| `manifest.json` | Dataset metadata, row counts, file index, and disclaimer. |

## Telemetry schema

| Column | Type | Meaning |
|---|---|---|
| `patient_id` | string | Synthetic patient identifier |
| `timestamp` | ISO-8601 string | 5-minute sample timestamp |
| `glucose_mg_dl` | float | Synthetic CGM glucose (mg/dL) |
| `heart_rate_bpm` | float | Synthetic PPG heart rate |
| `hrv_rmssd_ms` | float | Synthetic HRV (rMSSD, ms) |
| `sleep_stage` | string | `Awake`, `Light`, `Deep`, or `REM` |
| `step_count` | integer | Synthetic step count in the 5-minute bucket |
| `meal_event` | 0/1 | Meal marker |
| `medication_event` | 0/1 | Medication marker |

## Demo window

- Start: `2025-01-14T07:00:00`
- End: `2025-01-15T07:00:00`
- Duration: 24 hours
- Sampling: every 5 minutes
- Rows: 867 combined (289 per patient)

The window includes the full overnight period used by the dashboard
(20:00 dinner through the 03:30 recovery window).

## Patients

| Patient ID | Name | Profile |
|---|---|---|
| `IN-PAT-4089` | Ramesh Kumar | High risk — sulfonylurea, mild CKD, prior severe hypos |
| `IN-PAT-2194` | Sunita Mehta | Moderate risk — DPP-4 inhibitor + metformin |
| `IN-PAT-1052` | Amit Sharma | Low risk — stable early-stage T2D |

## Known limitation

The synthetic telemetry itself stays above 70 mg/dL for all three patients in
this export (the high-risk patient's lowest CGM value is about 96 mg/dL). The
dashboard's predictive engine is what projects the nocturnal crash. If you need
the raw telemetry to visibly cross the Level 1 (<70) and Level 2 (<54) thresholds,
the generator's pharmacodynamic effect should be strengthened before exporting.

## Regenerate

```bash
python GlycoTwin_India/data/export_synthetic_data.py
```

The generator now uses a stable SHA-256-based seed, so repeated exports produce
the same values.
