
import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useState
} from "react";

import {
  Activity,
  AlertTriangle,
  GraduationCap,
  LayoutDashboard,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
  Brain,
  Target
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { api } from "./api";

import type {
  Analytics,
  Risk,
  Student,
  StudentInput
} from "./types";

// DEFAULT STUDENT FORM

const blank: StudentInput = {
  name: "",
  department: "AI&DS",
  year: 3,
  attendance: 80,
  internal_marks: 70,
  study_hours: 2,
  previous_score: 70
};

// RISK COLORS

const colors: Record<Risk, string> = {
  Low: "#16a34a",
  Medium: "#f59e0b",
  High: "#ef4444"
};

// MAIN APP

export default function App() {

  // STUDENT DATA

  const [rows, setRows] = useState<Student[]>([]);

  const [stats, setStats] =
    useState<Analytics | null>(null);

  // SEARCH AND FILTER

  const [q, setQ] = useState("");

  const [risk, setRisk] = useState("All");

  // ADD STUDENT FORM

  const [form, setForm] = useState(blank);

  const [modal, setModal] = useState(false);

  const [busy, setBusy] = useState(false);

  // LOADING

  const [loading, setLoading] = useState(true);

  // NOTIFICATIONS

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  // INDIVIDUAL PREDICTION INPUT

  const [predictionInput, setPredictionInput] =
    useState({
      attendance: 80,
      internal_marks: 70,
      study_hours: 2,
      previous_score: 65
    });

  // PREDICTION RESULT

  const [predictionResult, setPredictionResult] =
    useState<{
      predicted_score: number;
      risk_level: string;
      message: string;
    } | null>(null);

  const [predicting, setPredicting] = useState(false);

  const [predictionError, setPredictionError] =
    useState("");

  // SIDEBAR NAVIGATION

  const [activeNav, setActiveNav] =
    useState("Dashboard");

  const goTo = (name: string, id: string) => {

    setActiveNav(name);

    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  };

  // LOAD STUDENTS AND ANALYTICS

  const refresh = useCallback(async () => {

    setLoading(true);

    setError("");

    try {

      const [s, a] = await Promise.all([
        api.students(q, risk),
        api.analytics()
      ]);

      setRows(s);

      setStats(a);

    } catch (e) {

      setError(
        e instanceof Error
          ? e.message
          : "Could not load data"
      );

    } finally {

      setLoading(false);

    }

  }, [q, risk]);

  useEffect(() => {

    void refresh();

  }, [refresh]);

  // INDIVIDUAL STUDENT PREDICTION


const handlePrediction = async () => {

    const fields = [
      { key: "attendance", label: "Attendance" },
      { key: "internal_marks", label: "Internal marks" },
      { key: "study_hours", label: "Study hours" },
      { key: "previous_score", label: "Previous score" }
    ] as const;

    const emptyField = fields.find(
      field => !Number.isFinite(predictionInput[field.key])
    );

    if (emptyField) {
      setPredictionError(`${emptyField.label} is required.`);
      setPredictionResult(null);
      return;
    }

    setPredicting(true);

    setPredictionError("");

    setPredictionResult(null);

    try {


      const result = await api.predict(
        predictionInput
      );

      setPredictionResult(result);

    } catch (e) {

      setPredictionError(
        e instanceof Error
          ? e.message
          : "Prediction failed"
      );

    } finally {

      setPredicting(false);

    }

  };

  // ADD STUDENT

  async function submit(e: FormEvent) {

    e.preventDefault();

    setBusy(true);

    setError("");

    try {

      await api.add(form);

      setMessage(
        "Student saved; prediction generated."
      );

      setForm(blank);

      setModal(false);

      await refresh();

    } catch (e) {

      setError(
        e instanceof Error
          ? e.message
          : "Save failed"
      );

    } finally {

      setBusy(false);

    }

  }

  // LOAD DEMO DATA

  async function demo() {

    setError("");

    try {

      const r = await api.demo();

      setMessage(r.message);

      await refresh();

    } catch (e) {

      setError(
        e instanceof Error
          ? e.message
          : "Demo data failed"
      );

    }

  }

  // DELETE STUDENT

  async function remove(id: number) {

    if (
      !window.confirm(
        "Delete this student record?"
      )
    ) return;

    try {

      await api.remove(id);

      setMessage("Record deleted.");

      await refresh();

    } catch (e) {

      setError(
        e instanceof Error
          ? e.message
          : "Delete failed"
      );

    }

  }

  // MAIN UI

  return (

    <div className="layout">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="brand">

          <span className="brand-logo">
            <GraduationCap />
          </span>

          <span>
            <b>EduMetrics</b>
            <small>AI Student Insights</small>
          </span>

        </div>

        <p className="nav-label">
          WORKSPACE
        </p>

        <div
          className={`nav ${
            activeNav === "Dashboard" ? "active" : ""
          }`}
          onClick={() =>
            goTo("Dashboard", "dashboard")
          }
          style={{ cursor: "pointer" }}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </div>

        <div
          className={`nav ${
            activeNav === "Prediction" ? "active" : ""
          }`}
          onClick={() =>
            goTo("Prediction", "prediction")
          }
          style={{ cursor: "pointer" }}
        >
          <Brain size={18} />
          Prediction
        </div>

        <div
          className={`nav ${
            activeNav === "Students" ? "active" : ""
          }`}
          onClick={() =>
            goTo("Students", "students")
          }
          style={{ cursor: "pointer" }}
        >
          <Users size={18} />
          Students
        </div>

        <div
          className={`nav ${
            activeNav === "Analytics" ? "active" : ""
          }`}
          onClick={() =>
            goTo("Analytics", "analytics")
          }
          style={{ cursor: "pointer" }}
        >
          <Activity size={18} />
          Analytics
        </div>

        <div className="side-bottom">

          <b>KM</b>

          <span>
            <strong>Admin User</strong>
            <small>Demo workspace</small>
          </span>

        </div>

      </aside>

      {/* MAIN CONTENT */}

      <main className="main" id="dashboard">

        {/* HEADER */}

        <header className="header">

          <div>

            <small className="eyebrow">
              ACADEMIC OVERVIEW
            </small>

            <h1>Student Dashboard</h1>

            <p>
              Track performance and explore student insights.
            </p>

          </div>

          <div className="actions">

            <button
              className="btn light"
              onClick={() => void refresh()}
            >
              <RefreshCw size={15} />
              Refresh
            </button>

            <button
              className="btn primary"
              onClick={() => setModal(true)}
            >
              <Plus size={16} />
              Add student
            </button>

          </div>

        </header>

        {/* NOTIFICATIONS */}

        {error && (

          <div className="notice err">

            {error}

            <button onClick={() => setError("")}>
              <X size={15} />
            </button>

          </div>

        )}

        {message && (

          <div className="notice ok">

            {message}

            <button onClick={() => setMessage("")}>
              <X size={15} />
            </button>

          </div>

        )}

        {/* STATISTICS */}

        <section className="stats">

          <Stat
            icon={<Users />}
            label="Total students"
            value={stats?.total_students ?? "—"}
            hint="Saved records"
          />

          <Stat
            icon={<GraduationCap />}
            label="Average predicted score"
            value={
              stats
                ? `${stats.average_predicted_score}%`
                : "—"
            }
            hint="Model estimate"
          />

          <Stat
            icon={<Activity />}
            label="Average attendance"
            value={
              stats
                ? `${stats.average_attendance}%`
                : "—"
            }
            hint="Across records"
          />

          <Stat
            icon={<AlertTriangle />}
            label="High-risk students"
            value={
              stats?.risk_distribution.find(
                x => x.risk === "High"
              )?.count ?? 0
            }
            hint="Estimated score below 40"
          />

        </section>

        {/* INDIVIDUAL PREDICTION */}

        <section
          className="panel records"
          id="prediction"
        >

          <div className="panel-head">

            <div>
              <h2>
                <Brain
                  size={21}
                  style={{
                    verticalAlign: "middle",
                    marginRight: 8
                  }}
                />
                Individual Student Prediction
              </h2>

              <p>
                Enter academic details to estimate student performance.
              </p>
            </div>

          </div>

          <div className="formgrid">

            <Num
              label="Attendance (%)"
              value={predictionInput.attendance}
              max={100}
              onChange={v =>
                setPredictionInput({
                  ...predictionInput,
                  attendance: v
                })
              }
            />

            <Num
              label="Internal marks (%)"
              value={predictionInput.internal_marks}
              max={100}
              onChange={v =>
                setPredictionInput({
                  ...predictionInput,
                  internal_marks: v
                })
              }
            />

          </div>

          <div className="formgrid">

            <Num
              label="Study hours/day"
              value={predictionInput.study_hours}
              max={24}
              onChange={v =>
                setPredictionInput({
                  ...predictionInput,
                  study_hours: v
                })
              }
            />

            <Num
              label="Previous score (%)"
              value={predictionInput.previous_score}
              max={100}
              onChange={v =>
                setPredictionInput({
                  ...predictionInput,
                  previous_score: v
                })
              }
            />

          </div>

          <div className="modal-actions">

            <button
              className="btn primary"
              onClick={() => void handlePrediction()}
              disabled={predicting}
            >

              <Target size={16} />

              {predicting
                ? "Predicting..."
                : "Predict Performance"}

            </button>

          </div>

          {/* PREDICTION ERROR */}

          {predictionError && (

            <div className="notice err">
              {predictionError}
            </div>

          )}

          {/* PREDICTION RESULT */}

          {predictionResult && (

            <div className="stat">

              <div className="stat-icon">
                <GraduationCap />
              </div>

              <small>Predicted Score</small>

              <strong>
                {predictionResult.predicted_score}%
              </strong>

              <span>
                Risk Level:
                {" "}
                <b
                  style={{
                    color:
                      colors[
                        predictionResult.risk_level as Risk
                      ] ?? "#64748b"
                  }}
                >
                  {predictionResult.risk_level}
                </b>
              </span>

              <p>
                {predictionResult.message}
              </p>

              <small>
                Predictions are estimates, not official grades.
              </small>

            </div>

          )}

        </section>

        {/* ANALYTICS */}

        <section
          className="charts"
          id="analytics"
        >

          {/* RISK DISTRIBUTION */}

          <article className="panel">

            <div className="panel-head">

              <div>
                <h2>Risk distribution</h2>
                <p>
                  Students by estimated risk category
                </p>
              </div>

            </div>

            {stats?.risk_distribution.length ? (

              <>

                <div className="pie">

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <PieChart>

                      <Pie
                        data={stats.risk_distribution}
                        dataKey="count"
                        nameKey="risk"
                        innerRadius={57}
                        outerRadius={85}
                        paddingAngle={4}
                      >

                        {stats.risk_distribution.map(x => (

                          <Cell
                            key={x.risk}
                            fill={colors[x.risk]}
                          />

                        ))}

                      </Pie>

                      <Tooltip />

                    </PieChart>

                  </ResponsiveContainer>

                </div>

                <div className="legend">

                  {(
                    ["Low", "Medium", "High"] as Risk[]
                  ).map(r => (

                    <span key={r}>
                      <i
                        style={{
                          background: colors[r]
                        }}
                      />
                      {r}
                    </span>

                  ))}

                </div>

              </>

            ) : (

              <Empty />

            )}

          </article>

          {/* DEPARTMENT PERFORMANCE */}

          <article className="panel">

            <div className="panel-head">

              <div>
                <h2>Department performance</h2>
                <p>
                  Average predicted score by department
                </p>
              </div>

            </div>

            {stats?.department_performance.length ? (

              <div className="bars">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={stats.department_performance}
                    margin={{
                      top: 10,
                      right: 8,
                      left: -20,
                      bottom: 4
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="department"
                      tick={{ fontSize: 11 }}
                    />

                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 10 }}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="average_score"
                      name="Average score"
                      fill="#5869e8"
                      radius={[6, 6, 0, 0]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            ) : (

              <Empty />

            )}

          </article>

        </section>

        {/* STUDENT RECORDS */}

        <section
          className="panel records"
          id="students"
        >

          <div className="records-head">

            <div>
              <h2>Student records</h2>
              <p>
                Academic inputs and model predictions
              </p>
            </div>

            <button
              className="btn outline"
              onClick={() => void demo()}
            >
              <Plus size={15} />
              Load demo data
            </button>

          </div>

          {/* SEARCH AND FILTER */}

          <div className="filters">

            <div className="search">

              <Search size={16} />

              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search name or department"
              />

            </div>

            <select
              value={risk}
              onChange={e => setRisk(e.target.value)}
            >

              <option>All</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>

            </select>

            <small>
              {rows.length} records
            </small>

          </div>

          {/* STUDENT TABLE */}

          <div className="table-wrap">

            <table>

              <thead>

                <tr>
                  <th>STUDENT</th>
                  <th>DEPARTMENT</th>
                  <th>ATTENDANCE</th>
                  <th>INTERNAL</th>
                  <th>STUDY HRS</th>
                  <th>PREDICTED</th>
                  <th>RISK</th>
                  <th></th>
                </tr>

              </thead>

              <tbody>

                {rows.map(s => (

                  <tr key={s.id}>

                    <td>

                      <b>{s.name}</b>

                      <small>
                        Year {s.year} · #{s.id}
                      </small>

                    </td>

                    <td>{s.department}</td>

                    <td>{s.attendance}%</td>

                    <td>{s.internal_marks}%</td>

                    <td>{s.study_hours}</td>

                    <td>
                      <strong>
                        {s.predicted_score}%
                      </strong>
                    </td>

                    <td>

                      <span
                        className={`pill ${
                          s.risk_level.toLowerCase()
                        }`}
                      >
                        {s.risk_level}
                      </span>

                    </td>

                    <td>

                      <button
                        className="delete"
                        title="Delete"
                        onClick={() =>
                          void remove(s.id)
                        }
                      >
                        <Trash2 size={15} />
                      </button>

                    </td>

                  </tr>

                ))}

                {!loading && !rows.length && (

                  <tr>

                    <td
                      colSpan={8}
                      className="empty-row"
                    >
                      No records. Add a student or load demo data.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {loading && (
            <p className="loading">
              Loading…
            </p>
          )}

          <div className="table-foot">
            Predictions are estimates, not official grades.
          </div>

        </section>

        {/* FOOTER */}

        <footer>
          EduMetrics · Student Performance Prediction & Analytics · Academic demo
        </footer>

      </main>

      {/* ADD STUDENT MODAL */}

      {modal && (

        <div
          className="overlay"
          onMouseDown={e => {

            if (e.target === e.currentTarget) {
              setModal(false);
            }

          }}
        >

          <section className="modal">

            <div className="modal-head">

              <div>
                <h2>Add student</h2>
                <p>
                  Enter academic inputs to estimate performance.
                </p>
              </div>

              <button
                className="delete"
                onClick={() => setModal(false)}
              >
                <X />
              </button>

            </div>

            <form onSubmit={submit}>

              <label>

                Student name

                <input
                  required
                  maxLength={120}
                  value={form.name}
                  onChange={e =>
                    setForm({
                      ...form,
                      name: e.target.value
                    })
                  }
                  placeholder="e.g. Kavya R"
                />

              </label>

              <div className="formgrid">

                <label>

                  Department

                  <input
                    required
                    value={form.department}
                    onChange={e =>
                      setForm({
                        ...form,
                        department: e.target.value
                      })
                    }
                  />

                </label>

                <label>

                  Year

                  <select
                    value={form.year}
                    onChange={e =>
                      setForm({
                        ...form,
                        year: Number(e.target.value)
                      })
                    }
                  >

                    {[1, 2, 3, 4, 5, 6].map(y => (

                      <option key={y} value={y}>
                        {y}
                      </option>

                    ))}

                  </select>

                </label>

              </div>

              <div className="formgrid">

                <Num
                  label="Attendance (%)"
                  value={form.attendance}
                  max={100}
                  onChange={v =>
                    setForm({
                      ...form,
                      attendance: v
                    })
                  }
                />

                <Num
                  label="Internal marks (%)"
                  value={form.internal_marks}
                  max={100}
                  onChange={v =>
                    setForm({
                      ...form,
                      internal_marks: v
                    })
                  }
                />

              </div>

              <div className="formgrid">

                <Num
                  label="Study hours/day"
                  value={form.study_hours}
                  max={24}
                  onChange={v =>
                    setForm({
                      ...form,
                      study_hours: v
                    })
                  }
                />

                <Num
                  label="Previous score (%)"
                  value={form.previous_score}
                  max={100}
                  onChange={v =>
                    setForm({
                      ...form,
                      previous_score: v
                    })
                  }
                />

              </div>

              <p className="form-note">
                Use fictional or consented data. Model outputs are
                estimates and may be inaccurate.
              </p>

              <div className="modal-actions">

                <button
                  type="button"
                  className="btn light"
                  onClick={() => setModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="btn primary"
                  disabled={busy}
                >
                  {busy
                    ? "Saving..."
                    : "Save & predict"}
                </button>

              </div>

            </form>

          </section>

        </div>

      )}

    </div>

  );

}

// STATISTICS CARD

function Stat({
  icon,
  label,
  value,
  hint
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  hint: string;
}) {

  return (

    <article className="stat">

      <div className="stat-icon">
        {icon}
      </div>

      <small>{label}</small>

      <strong>{value}</strong>

      <span>{hint}</span>

    </article>

  );

}

// EMPTY STATE

function Empty() {

  return (

    <div className="empty">
      No data yet. Add a student or load demo data.
    </div>

  );

}

// NUMBER INPUT

function Num({
  label,
  value,
  max,
  onChange
}: {
  label: string;
  value: number;
  max: number;
  onChange: (v: number) => void;
}) {

  return (

    <label>

      {label}

      <input
        type="number"
        min={0}
        max={max}
        step=".1"
        required
        value={Number.isNaN(value) ? "" : value}
onChange={e =>
  onChange(
    e.target.value === ""
      ? NaN
      : Number(e.target.value)
  )
}
      />

    </label>

  );

}
