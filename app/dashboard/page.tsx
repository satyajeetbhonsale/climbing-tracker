export const dynamic = "force-dynamic";

import { fetchClimbs } from "@/lib/supabase";
import { GRADES, type Grade } from "@/lib/constants";
import GradePyramid from "@/components/GradePyramid";
import GradeBarChart from "@/components/GradeBarChart";
import DonutChart from "@/components/DonutChart";
import GradeTrendChart from "@/components/GradeTrendChart";
import ClimbingHeatmap from "@/components/ClimbingHeatmap";
import GradeAvgChart, { type AvgPoint } from "@/components/GradeAvgChart";
import type { Climb } from "@/lib/types";

function zeroCounts(): Record<Grade, number> {
  return Object.fromEntries(GRADES.map((g) => [g, 0])) as Record<Grade, number>;
}

function topGrade(counts: Record<Grade, number>): string {
  const max = Math.max(...Object.values(counts));
  if (max === 0) return "—";
  const candidates = GRADES.filter((g) => counts[g] === max);
  return candidates[candidates.length - 1];
}

function maxSentGrade(climbs: Climb[]): string {
  const sent = climbs.filter((c) => c.is_sent);
  if (sent.length === 0) return "—";
  return sent.reduce((best, c) => {
    const idx = GRADES.indexOf(c.grade as Grade);
    return idx > GRADES.indexOf(best as Grade) ? c.grade : best;
  }, sent[0].grade);
}

function formatMinutes(mins: number): string {
  if (mins === 0) return "0 min";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

function currentMonthPrefix(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(): string {
  return new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export default async function DashboardPage() {
  let attemptCounts = zeroCounts();
  let sendCounts = zeroCounts();
  let totalAttempts = 0;
  let totalSends = 0;
  let mostAttemptedGrade = "—";
  let mostSentGrade = "—";

  // Grade trend data
  let gradeTrendPoints: { month: string; gradeIndex: number }[] = [];

  // Grade avg chart data
  let gradeAvgPoints: AvgPoint[] = [];

  // Heatmap data
  let dayCounts: Record<string, number> = {};

  // Discipline + environment counts
  let boulderCount = 0;
  let topropeCount = 0;
  let leadCount = 0;
  let indoorCount = 0;
  let outdoorCount = 0;

  // Per-discipline grade counts
  let topopeCounts = zeroCounts();
  let leadCounts = zeroCounts();
  let boulderCounts = zeroCounts();

  // Monthly stats
  let monthlyClimbs = 0;
  let monthlySends = 0;
  let monthlyMaxSent = "—";
  let monthlyTimeSpent = "0 min";
  let monthlyOutdoorDays = 0;

  let fetchError = "";

  try {
    const climbs = await fetchClimbs();
    const prefix = currentMonthPrefix();
    const thisMonth = climbs.filter((c) => c.date.startsWith(prefix));

    // Heatmap: count climbs per date
    for (const climb of climbs) {
      dayCounts[climb.date] = (dayCounts[climb.date] ?? 0) + 1;
    }

    // All-time counts for charts
    for (const climb of climbs) {
      const g = climb.grade as Grade;
      attemptCounts[g] += 1;
      if (climb.is_sent) sendCounts[g] += 1;
      if (climb.discipline === "boulder") { boulderCount++; boulderCounts[g] += 1; }
      else if (climb.discipline === "toprope") { topropeCount++; topopeCounts[g] += 1; }
      else if (climb.discipline === "lead") { leadCount++; leadCounts[g] += 1; }
      if (climb.environment === "indoor") indoorCount++;
      else outdoorCount++;
    }
    // Grade trend: highest grade sent per month
    const maxByMonth = new Map<string, number>(); // "YYYY-MM" → gradeIndex
    for (const climb of climbs) {
      if (!climb.is_sent) continue;
      const ym = climb.date.slice(0, 7); // "YYYY-MM"
      const idx = GRADES.indexOf(climb.grade as Grade);
      if (idx === -1) continue;
      maxByMonth.set(ym, Math.max(maxByMonth.get(ym) ?? -1, idx));
    }
    gradeTrendPoints = Array.from(maxByMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([ym, gradeIndex]) => ({
        month: new Date(ym + "-01").toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
        gradeIndex,
      }));

    // Grade avg chart: avg attempted and avg sent per month
    const monthAttempted = new Map<string, number[]>(); // ym → [gradeIndex, ...]
    const monthSent = new Map<string, number[]>();
    for (const climb of climbs) {
      const ym = climb.date.slice(0, 7);
      const idx = GRADES.indexOf(climb.grade as Grade);
      if (idx === -1) continue;
      if (!monthAttempted.has(ym)) monthAttempted.set(ym, []);
      monthAttempted.get(ym)!.push(idx);
      if (climb.is_sent) {
        if (!monthSent.has(ym)) monthSent.set(ym, []);
        monthSent.get(ym)!.push(idx);
      }
    }
    const avg = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / arr.length;
    gradeAvgPoints = Array.from(monthAttempted.keys())
      .sort()
      .map((ym) => ({
        month: new Date(ym + "-01").toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
        avgAttempted: avg(monthAttempted.get(ym)!),
        avgSent: monthSent.has(ym) ? avg(monthSent.get(ym)!) : null,
      }));

    totalAttempts = climbs.length;
    totalSends = climbs.filter((c) => c.is_sent).length;
    mostAttemptedGrade = topGrade(attemptCounts);
    mostSentGrade = topGrade(sendCounts);

    // Monthly stats
    monthlyClimbs = thisMonth.length;
    monthlySends = thisMonth.filter((c) => c.is_sent).length;
    monthlyMaxSent = maxSentGrade(thisMonth);
    monthlyTimeSpent = formatMinutes(
      thisMonth.reduce((sum, c) => sum + (c.time_spent_minutes ?? 0), 0)
    );
    monthlyOutdoorDays = new Set(
      thisMonth.filter((c) => c.environment === "outdoor").map((c) => c.date)
    ).size;
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to load climbs";
  }

  const monthlyCards = [
    { label: "Climbs", value: monthlyClimbs },
    { label: "Sends", value: monthlySends },
    { label: "Max grade sent", value: monthlyMaxSent },
    { label: "Time spent", value: monthlyTimeSpent },
    { label: "Outdoor days", value: monthlyOutdoorDays },
  ];

  const allTimeStats = [
    { label: "Total attempts", value: totalAttempts },
    { label: "Total sends", value: totalSends },
    { label: "Most attempted grade", value: mostAttemptedGrade },
    { label: "Most sent grade", value: mostSentGrade },
  ];

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Dashboard</h1>

      {fetchError && (
        <p className="mb-6 text-sm text-red-600">{fetchError}</p>
      )}

      {/* Monthly summary */}
      <section className="mb-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
          {monthLabel()}
        </h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {monthlyCards.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg border border-gray-200 bg-white px-4 py-4 shadow-sm"
            >
              <p className="truncate text-2xl font-bold text-gray-900">{value}</p>
              <p className="mt-0.5 text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* All-time summary */}
      <section className="mb-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
          All time
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {allTimeStats.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg border border-gray-200 bg-white px-4 py-4 shadow-sm"
            >
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="mt-0.5 text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Donut charts */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DonutChart
          title="Discipline split"
          slices={[
            { label: "Boulder", count: boulderCount },
            { label: "Top rope", count: topropeCount },
            { label: "Lead", count: leadCount },
          ]}
          colors={["#111827", "#6b7280", "#d1d5db"]}
        />
        <DonutChart
          title="Environment split"
          slices={[
            { label: "Indoor", count: indoorCount },
            { label: "Outdoor", count: outdoorCount },
          ]}
          colors={["#111827", "#6b7280"]}
        />
      </div>

      {/* Grade trend */}
      <div className="mb-4">
        <GradeTrendChart points={gradeTrendPoints} />
      </div>

      {/* Grade avg */}
      <div className="mb-4">
        <GradeAvgChart points={gradeAvgPoints} />
      </div>

      {/* Overall grade bar chart */}
      <div className="mb-4">
        <GradeBarChart counts={attemptCounts} />
      </div>

      {/* Grade distribution by discipline */}
      <section className="mb-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Grade distribution by discipline
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <GradeBarChart counts={topopeCounts} title="Top rope" />
          <GradeBarChart counts={leadCounts} title="Lead" />
          <GradeBarChart counts={boulderCounts} title="Boulder" />
        </div>
      </section>

      {/* Pyramids */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <GradePyramid title="Attempts pyramid" counts={attemptCounts} />
        <GradePyramid title="Sends pyramid" counts={sendCounts} />
      </div>

      {/* Heatmap */}
      <ClimbingHeatmap dayCounts={dayCounts} />
    </div>
  );
}
