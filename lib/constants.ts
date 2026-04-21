export const GRADES = [
  "4",
  "5a",
  "5b",
  "5c",
  "5c+",
  "6a",
  "6a+",
  "6b",
  "6b+",
  "6c",
  "6c+",
  "7a",
] as const;

export type Grade = (typeof GRADES)[number];

// Ordered index for charts (lower index = easier)
export const GRADE_ORDER: Record<Grade, number> = Object.fromEntries(
  GRADES.map((g, i) => [g, i])
) as Record<Grade, number>;
