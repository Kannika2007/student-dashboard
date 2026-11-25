from pathlib import Path
import joblib
import numpy as np

FEATURES = ["attendance", "internal_marks", "study_hours", "previous_score"]

class PerformancePredictor:
    def __init__(self, model_path):
        self.model_path = Path(model_path)
        self.model = joblib.load(self.model_path) if self.model_path.exists() else None

    def predict(self, values):
        if self.model is None:
            raise RuntimeError("Model missing. Run `python train_model.py` in backend first.")
        row = np.array([[float(values[k]) for k in FEATURES]])
        score = float(np.clip(self.model.predict(row)[0], 0, 100))
        risk = "High" if score < 40 else ("Medium" if score < 60 else "Low")
        return round(score, 1), risk
