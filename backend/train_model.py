# Train a demo model on reproducible fictional data. Not a validated education model.
from pathlib import Path
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from ml.predictor import FEATURES

def main():
    rng = np.random.default_rng(42)
    n = 1200
    attendance = rng.uniform(35, 100, n)
    internal = rng.uniform(20, 100, n)
    study = rng.uniform(0, 8, n)
    previous = rng.uniform(15, 100, n)
    target = np.clip(0.20*attendance + 0.30*internal + 3*study + 0.40*previous + rng.normal(0, 6, n), 0, 100)
    data = pd.DataFrame({"attendance":attendance, "internal_marks":internal, "study_hours":study, "previous_score":previous, "final_score":target})
    X_train, X_test, y_train, y_test = train_test_split(data[FEATURES], data.final_score, test_size=0.2, random_state=42)
    model = RandomForestRegressor(n_estimators=180, max_depth=12, min_samples_leaf=2, random_state=42)
    model.fit(X_train, y_train)
    pred = model.predict(X_test)
    out = Path("ml/student_model.joblib")
    out.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, out)
    print(f"Saved model: {out}")
    print(f"Synthetic-data MAE: {mean_absolute_error(y_test, pred):.2f}; R2: {r2_score(y_test, pred):.3f}")
    print("These metrics are not evidence of real-world student prediction accuracy.")

if __name__ == "__main__":
    main()
