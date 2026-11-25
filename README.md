# Student Performance Prediction & Analytics Dashboard

Full-stack AI&DS project: Python, Flask, Pandas, Scikit-learn, MySQL, React, TypeScript, HTML, CSS and JavaScript.

## Features
- Add student marks, attendance, study hours and previous score.
- Predict an estimated score and Low/Medium/High risk category.
- Dashboard KPIs, risk chart, department chart, search and risk filter.
- MySQL storage and fictional demo data.

## Setup
1. Install Python 3.10+, Node.js 18+ and MySQL 8+.
2. In MySQL run: `CREATE DATABASE student_performance;`
3. Copy `backend/.env.example` to `backend/.env` and set your MySQL password in `DATABASE_URL`.
4. Backend:
   ```bash
   cd backend
   python -m venv .venv
   # Windows: .venv\Scripts\activate
   # macOS/Linux: source .venv/bin/activate
   pip install -r requirements.txt
   python train_model.py
   python app.py
   ```
5. Frontend in another terminal:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
6. Open the Vite URL (normally http://localhost:5173), then click **Load demo data**.

## API
- `GET /api/health`
- `GET /api/students?q=&risk=All`
- `POST /api/students`
- `GET /api/students/<id>`
- `DELETE /api/students/<id>`
- `GET /api/analytics`
- `POST /api/demo-data`

## Model and limitations
The training script creates reproducible fictional data and trains a Random Forest Regressor. Inputs are attendance, internal marks, study hours/day and previous score. Risk thresholds are demo rules: High <40, Medium 40–59.9, Low >=60. The reported validation metrics are only on synthetic data; they do not establish real-world accuracy. Use real, consented, representative data and validate carefully before any practical use. Never use predictions as the sole basis for grading or student decisions.

## GitHub
```bash
git init
git add .
git commit -m "Build student performance analytics dashboard"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/student-performance-dashboard.git
git push -u origin main
```
Do not upload real student personal data or secrets. `.env` and trained model files are ignored by Git.
