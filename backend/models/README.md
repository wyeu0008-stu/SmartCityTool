# SmartCycle Models

Place deployment model artifacts for backend inference in this folder.

Default model expected by the backend:

```text
smartcycle_external_segment_risk_model.joblib
```

The backend loads this file by default. To use a different model location, set:

```text
SMARTCYCLE_MODEL_PATH=models/smartcycle_external_segment_risk_model.joblib
```
