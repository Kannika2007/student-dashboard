
import type { Analytics, Student, StudentInput } from "./types";

const BASE =
  import.meta.env.VITE_API_BASE ?? "https://student-dashboard-api-ast3.onrender.com/api";

async function req<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      body.error ?? `Request failed (${res.status})`
    );
  }

  return body as T;
}

export const api = {
  // Get students
  students: (q = "", risk = "All") =>
    req<Student[]>(
      `/students?q=${encodeURIComponent(q)}&risk=${encodeURIComponent(risk)}`
    ),

  // Get analytics
  analytics: () =>
    req<Analytics>("/analytics"),

  // Add student
  add: (s: StudentInput) =>
    req<Student>("/students", {
      method: "POST",
      body: JSON.stringify(s)
    }),

  // Delete student
  remove: (id: number) =>
    req<{ message: string }>(`/students/${id}`, {
      method: "DELETE"
    }),

  // Load demo data
  demo: () =>
    req<{ message: string }>("/demo-data", {
      method: "POST"
    }),

  // Individual student prediction
  predict: (values: {
    attendance: number;
    internal_marks: number;
    study_hours: number;
    previous_score: number;
  }) =>
    req<{
      predicted_score: number;
      risk_level: string;
      message: string;
    }>("/predict", {
      method: "POST",
      body: JSON.stringify(values)
    })
};
