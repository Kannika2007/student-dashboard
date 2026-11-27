import os
from dotenv import load_dotenv
load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = "sqlite:///student_performance.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    MODEL_PATH = os.path.join(
    os.path.dirname(__file__), "ml", "student_model.joblib"
)