import os
from pathlib import Path
from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy import func, or_
from config import Config
from database import db
from models import Student
from ml.predictor import PerformancePredictor

app = Flask(__name__)
app.config.from_object(Config)
print("MODEL PATH:", app.config["MODEL_PATH"])
CORS(app, resources={r"/api/*": {"origins": "*"}})
db.init_app(app)
predictor = PerformancePredictor(app.config["MODEL_PATH"])
print("MODEL LOADED:", predictor.model is not None)
def error(message, status=400):
    return jsonify({"error": message}), status

def validate(payload):
    required = ["name", "attendance", "internal_marks", "study_hours", "previous_score"]
    missing = [k for k in required if payload.get(k) in (None, "")]
    if missing:
        return f"Missing fields: {', '.join(missing)}"
    try:
        v = {"name":str(payload["name"]).strip(), "department":str(payload.get("department","AI&DS")).strip() or "AI&DS",
             "year":int(payload.get("year",3)), "attendance":float(payload["attendance"]),
             "internal_marks":float(payload["internal_marks"]), "study_hours":float(payload["study_hours"]),
             "previous_score":float(payload["previous_score"])}
    except (TypeError, ValueError):
        return "Please enter valid numeric values."
    if not v["name"] or len(v["name"]) > 120: return "Name must be 1–120 characters."
    if not 1 <= v["year"] <= 6: return "Year must be between 1 and 6."
    for k in ("attendance","internal_marks","previous_score"):
        if not 0 <= v[k] <= 100: return f"{k} must be between 0 and 100."
    if not 0 <= v["study_hours"] <= 24: return "study_hours must be between 0 and 24."
    return v

@app.get("/api/health")
def health():
    return jsonify({"status":"ok","model_loaded":predictor.model is not None})

@app.get("/api/students")
def students():
    q, risk = request.args.get("q","").strip(), request.args.get("risk","").strip().title()
    query = Student.query
    if q:
        p = f"%{q}%"
        query = query.filter(or_(Student.name.ilike(p), Student.department.ilike(p)))
    if risk in {"Low","Medium","High"}: query = query.filter_by(risk_level=risk)
    return jsonify([s.to_dict() for s in query.order_by(Student.id.desc()).all()])

@app.post("/api/students")
def add_student():
    payload = request.get_json(silent=True) or {}
    values = validate(payload)
    if isinstance(values, str): return error(values)
    try: score, risk = predictor.predict(values)
    except RuntimeError as exc: return error(str(exc),503)
    s = Student(**values, predicted_score=score, risk_level=risk)
    db.session.add(s); db.session.commit()
    return jsonify(s.to_dict()), 201

@app.post("/api/predict")
def predict_student():
    payload = request.get_json(silent=True) or {}

    required = [
        "attendance",
        "internal_marks",
        "study_hours",
        "previous_score"
    ]

    missing = [k for k in required if payload.get(k) in (None, "")]

    if missing:
        return error(f"Missing fields: {', '.join(missing)}")

    try:
        values = {
            "attendance": float(payload["attendance"]),
            "internal_marks": float(payload["internal_marks"]),
            "study_hours": float(payload["study_hours"]),
            "previous_score": float(payload["previous_score"])
        }
    except (TypeError, ValueError):
        return error("Please enter valid numeric values.")

    for key in ("attendance", "internal_marks", "previous_score"):
        if not 0 <= values[key] <= 100:
            return error(f"{key} must be between 0 and 100.")

    if not 0 <= values["study_hours"] <= 24:
        return error("study_hours must be between 0 and 24.")

    try:
        score, risk = predictor.predict(values)
    except RuntimeError as exc:
        return error(str(exc), 503)

    return jsonify({
        "predicted_score": score,
        "risk_level": risk,
        "message": "Prediction generated successfully."
    })

@app.get("/api/students/<int:sid>")
def get_student(sid):
    s = db.session.get(Student,sid)
    return jsonify(s.to_dict()) if s else error("Student not found.",404)

@app.delete("/api/students/<int:sid>")
def delete_student(sid):
    s = db.session.get(Student,sid)
    if not s: return error("Student not found.",404)
    db.session.delete(s); db.session.commit()
    return jsonify({"message":"Student deleted."})

@app.get("/api/analytics")
def analytics():
    total = db.session.query(func.count(Student.id)).scalar() or 0
    avg_score = db.session.query(func.avg(Student.predicted_score)).scalar() or 0
    avg_att = db.session.query(func.avg(Student.attendance)).scalar() or 0
    risks = db.session.query(Student.risk_level,func.count(Student.id)).group_by(Student.risk_level).all()
    depts = db.session.query(Student.department,func.avg(Student.predicted_score),func.count(Student.id)).group_by(Student.department).all()
    top = db.session.query(Student.name,Student.predicted_score,Student.risk_level).order_by(Student.predicted_score.desc()).limit(10).all()
    return jsonify({"total_students":total,"average_predicted_score":round(float(avg_score),1),
      "average_attendance":round(float(avg_att),1),
      "risk_distribution":[{"risk":r,"count":c} for r,c in risks],
      "department_performance":[{"department":d,"average_score":round(float(a or 0),1),"count":c} for d,a,c in depts],
      "top_students":[{"name":n,"predicted_score":round(float(s),1),"risk_level":r} for n,s,r in top]})

@app.post("/api/demo-data")
def demo_data():
    if Student.query.count(): return error("Demo data can only be loaded into an empty table.",409)
    samples = [
      ("Aarav Kumar","AI&DS",3,94,88,3.5,82),("Meera S","AI&DS",3,86,76,2.5,73),
      ("Nila R","CSE",2,72,68,1.5,61),("Arun P","IT",3,48,42,.8,45),
      ("Divya M","AI&DS",3,97,92,4,91),("Kavin T","ECE",2,64,58,1.2,54),
      ("Sanjay V","CSE",3,79,81,2,70),("Priya K","IT",2,55,49,1,50)]
    if predictor.model is None: return error("Run python train_model.py first.",503)
    for name,dept,year,att,marks,hours,prev in samples:
        v={"name":name,"department":dept,"year":year,"attendance":att,"internal_marks":marks,"study_hours":hours,"previous_score":prev}
        score,risk=predictor.predict(v)
        db.session.add(Student(**v,predicted_score=score,risk_level=risk))
    db.session.commit()
    return jsonify({"message":f"Inserted {len(samples)} fictional demo students."}),201

@app.errorhandler(500)
def internal_error(_):
    db.session.rollback()
    return error("Internal server error. Check backend terminal.",500)

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    import os
app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=False)
