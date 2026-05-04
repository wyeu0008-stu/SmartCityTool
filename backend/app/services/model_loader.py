import os
from pathlib import Path
from threading import Lock


BACKEND_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_MODEL_PATH = BACKEND_ROOT / "models" / "smartcycle_external_segment_risk_model.joblib"

DEFAULT_FEATURE_COLUMNS = [
    "length_m",
    "speed_limit",
    "road_type_encoded",
    "bike_infra_score",
    "has_protected_lane",
    "has_bike_lane",
    "has_tram_track",
    "has_onstreet_parking",
    "intersection_count_100m",
    "crash_count_3y",
    "serious_crash_count_3y",
    "cyclist_crash_count_3y",
    "crash_density_3y",
    "avg_daily_vehicle_volume",
    "avg_daily_bike_volume",
]


class SegmentRiskModel:
    def __init__(self):
        self._lock = Lock()
        self._loaded = False
        self._model = None
        self._feature_columns = DEFAULT_FEATURE_COLUMNS
        self._model_path = None
        self._error = None

    @property
    def available(self) -> bool:
        self.load()
        return self._model is not None

    @property
    def error(self) -> str | None:
        self.load()
        return self._error

    @property
    def feature_columns(self) -> list[str]:
        self.load()
        return self._feature_columns

    @property
    def model_path(self) -> str | None:
        self.load()
        return self._model_path

    def load(self):
        if self._loaded:
            return

        with self._lock:
            if self._loaded:
                return

            self._loaded = True
            model_path = self._resolve_model_path(
                os.getenv("SMARTCYCLE_MODEL_PATH") or DEFAULT_MODEL_PATH
            )
            self._model_path = str(model_path)

            if not model_path.exists():
                self._error = f"Model file not found: {model_path}"
                return

            try:
                import joblib

                loaded = joblib.load(model_path)
                self._model, self._feature_columns = self._unwrap_model(loaded)
            except Exception as exc:
                self._model = None
                self._error = f"Unable to load model: {exc}"

    def _resolve_model_path(self, raw_path) -> Path:
        path = Path(raw_path)

        if path.is_absolute():
            return path

        backend_relative = BACKEND_ROOT / path
        if backend_relative.exists():
            return backend_relative

        return Path.cwd() / path

    def predict_probabilities(self, feature_rows: list[dict]) -> list[float]:
        self.load()

        if not self._model or not feature_rows:
            return []

        import pandas as pd

        frame = pd.DataFrame(feature_rows)
        for column in self._feature_columns:
            if column not in frame.columns:
                frame[column] = 0

        frame = frame[self._feature_columns].fillna(0)

        if hasattr(self._model, "predict_proba"):
            probabilities = self._model.predict_proba(frame)
            return [float(row[-1]) for row in probabilities]

        predictions = self._model.predict(frame)
        return [float(value) for value in predictions]

    def _unwrap_model(self, loaded):
        if isinstance(loaded, dict):
            model = (
                loaded.get("model")
                or loaded.get("pipeline")
                or loaded.get("estimator")
                or loaded.get("crash_classifier")
            )
            feature_columns = (
                loaded.get("feature_columns")
                or loaded.get("feature_cols")
                or loaded.get("features")
                or loaded.get("feature_names")
            )

            if model is None:
                model = loaded

            return model, list(feature_columns or self._infer_feature_columns(model))

        return loaded, list(self._infer_feature_columns(loaded))

    def _infer_feature_columns(self, model):
        columns = getattr(model, "feature_names_in_", None)

        if columns is not None:
            return list(columns)

        return DEFAULT_FEATURE_COLUMNS


segment_risk_model = SegmentRiskModel()
