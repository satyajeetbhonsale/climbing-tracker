import { GRADES, type Grade } from "@/lib/constants";

interface GradePyramidProps {
  title: string;
  counts: Record<Grade, number>;
}

export default function GradePyramid({ title, counts }: GradePyramidProps) {
  const max = Math.max(...GRADES.map((g) => counts[g]), 1);

  // Render hardest grade at top, easiest at bottom
  const rows = [...GRADES].reverse();

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-5 py-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">{title}</h3>
      <div className="flex flex-col gap-1.5">
        {rows.map((grade) => {
          const count = counts[grade];
          const pct = (count / max) * 100;
          return (
            <div key={grade} className="flex items-center gap-2">
              <span className="w-8 shrink-0 text-right text-xs text-gray-400">{grade}</span>
              <div className="flex-1 overflow-hidden rounded-sm bg-gray-100" style={{ height: "18px" }}>
                {count > 0 && (
                  <div
                    className="h-full rounded-sm bg-gray-900"
                    style={{ width: `${pct}%` }}
                  />
                )}
              </div>
              <span className="w-5 shrink-0 text-right text-xs text-gray-400">
                {count > 0 ? count : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
