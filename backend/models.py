from datetime import datetime, timezone
from database import db

class Student(db.Model):
    __tablename__ = "students"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    department = db.Column(db.String(80), nullable=False, default="AI&DS")
    year = db.Column(db.Integer, nullable=False, default=3)
    attendance = db.Column(db.Float, nullable=False)
    internal_marks = db.Column(db.Float, nullable=False)
    study_hours = db.Column(db.Float, nullable=False)
    previous_score = db.Column(db.Float, nullable=False)
    predicted_score = db.Column(db.Float, nullable=False)
    risk_level = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {
            "id": self.id, "name": self.name, "department": self.department, "year": self.year,
            "attendance": round(self.attendance, 1), "internal_marks": round(self.internal_marks, 1),
            "study_hours": round(self.study_hours, 1), "previous_score": round(self.previous_score, 1),
            "predicted_score": round(self.predicted_score, 1), "risk_level": self.risk_level,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
