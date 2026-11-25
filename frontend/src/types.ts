export type Risk = "Low" | "Medium" | "High";
export interface Student {id:number;name:string;department:string;year:number;attendance:number;internal_marks:number;study_hours:number;previous_score:number;predicted_score:number;risk_level:Risk;created_at:string|null}
export interface Analytics {total_students:number;average_predicted_score:number;average_attendance:number;risk_distribution:{risk:Risk;count:number}[];department_performance:{department:string;average_score:number;count:number}[];top_students:{name:string;predicted_score:number;risk_level:Risk}[]}
export interface StudentInput {name:string;department:string;year:number;attendance:number;internal_marks:number;study_hours:number;previous_score:number}
