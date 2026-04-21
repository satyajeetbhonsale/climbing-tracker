import type { Grade } from "./constants";

export type Environment = "indoor" | "outdoor";
export type Discipline = "toprope" | "lead" | "boulder";

export interface Climb {
  id: string;
  created_at: string;
  date: string;
  environment: Environment;
  discipline: Discipline;
  name: string;
  grade: Grade;
  is_sent: boolean;
  attempts: number;
  location: string;
  time_spent_minutes: number | null;
  notes: string | null;
}

export type ClimbInsert = Omit<Climb, "id" | "created_at">;
