"use client";

import { useState } from "react";

interface Props {
  dayCounts: Record<string, number>;
}

const LEVELS = [
  { min: 0, max: 0, bg: "bg-gray-100", label: "0" },
  { min: 1, max: 1, bg: "bg-gray-300", label: "1" },
  { min: 2, max: 3, bg: "bg-gray-500", label: "2–3" },
  { min: 4, max: 5, bg: "bg-gray-700", label: "4–5" },
  { min: 6, max: Infinity, bg: "bg-gray-900", label: "6+" },
];

function levelFor(count: number) {
  return LEVELS.find((l) => count >= l.min && count <= l.max) ?? LEVELS[0];
}

function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

interface Cell {
  iso: string;
  date: Date;
  inYear: boolean; // false = padding cell outside Jan 1 – Dec 31
}

function buildGrid(year: number): Cell[][] {
  const jan1 = new Date(year, 0, 1);
  const dec31 = new Date(year, 11, 31);

  // Snap to Monday of the week containing Jan 1
  const startOffset = (jan1.getDay() + 6) % 7;
  const gridStart = addDays(jan1, -startOffset);

  // Snap to Sunday of the week containing Dec 31
  const endOffset = (dec31.getDay() + 6) % 7; // 0=Mon…6=Sun
  const gridEnd = addDays(dec31, 6 - endOffset);

  const weeks: Cell[][] = [];
  let cur = new Date(gridStart);

  while (cur <= gridEnd) {
    const week: Cell[] = [];
    for (let d = 0; d < 7; d++) {
      week.push({
        iso: toIso(cur),
        date: new Date(cur),
        inYear: cur >= jan1 && cur <= dec31,
      });
      cur = addDays(cur, 1);
    }
    weeks.push(week);
  }

  return weeks;
}

// Return the month label for a week column if that week introduces a new month
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function buildMonthLabels(weeks: Cell[][]): (string | null)[] {
  return weeks.map((week, wi) => {
    const firstInYear = week.find((c) => c.inYear);
    if (!firstInYear) return null;
    if (wi === 0) return MONTH_NAMES[firstInYear.date.getMonth()];
    const prevFirst = weeks[wi - 1].find((c) => c.inYear);
    if (!prevFirst) return MONTH_NAMES[firstInYear.date.getMonth()];
    if (firstInYear.date.getMonth() !== prevFirst.date.getMonth()) {
      return MONTH_NAMES[firstInYear.date.getMonth()];
    }
    return null;
  });
}

const WEEKDAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

export default function ClimbingHeatmap({ dayCounts }: Props) {
  const [tooltip, setTooltip] = useState<string | null>(null);

  const today = new Date();
  const year = today.getFullYear();
  const todayIso = toIso(today);

  const weeks = buildGrid(year);
  const monthLabels = buildMonthLabels(weeks);

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-5 py-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">
        Climbing days — {year}
      </h3>

      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-0 min-w-max">

          {/* Month labels */}
          <div className="flex mb-1 ml-8">
            {weeks.map((_, wi) => (
              <div key={wi} className="w-[14px] mr-[2px] text-[10px] text-gray-400 leading-none">
                {monthLabels[wi] ?? ""}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-0">
            {/* Weekday labels */}
            <div className="flex flex-col gap-[2px] mr-1">
              {WEEKDAY_LABELS.map((label, i) => (
                <div key={i} className="h-[12px] w-6 text-right text-[9px] leading-[12px] text-gray-400">
                  {label}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[2px] mr-[2px]">
                {week.map((cell, di) => {
                  // Padding cells outside Jan–Dec: invisible spacer
                  if (!cell.inYear) {
                    return <div key={di} className="h-[12px] w-[12px]" />;
                  }

                  // Future days: show faint placeholder, no interaction
                  if (cell.iso > todayIso) {
                    return (
                      <div
                        key={cell.iso}
                        className="h-[12px] w-[12px] rounded-[2px] bg-gray-50"
                      />
                    );
                  }

                  const count = dayCounts[cell.iso] ?? 0;
                  const level = levelFor(count);
                  const tipText = count === 0
                    ? `${cell.iso}: no climbs`
                    : `${cell.iso}: ${count} climb${count !== 1 ? "s" : ""}`;

                  return (
                    <div
                      key={cell.iso}
                      className={`h-[12px] w-[12px] rounded-[2px] cursor-default ${level.bg}`}
                      onMouseEnter={() => setTooltip(tipText)}
                      onMouseLeave={() => setTooltip(null)}
                      onClick={() => setTooltip(tipText === tooltip ? null : tipText)}
                      title={tipText}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tap tooltip for mobile */}
      {tooltip && (
        <p className="mt-2 text-xs text-gray-500">{tooltip}</p>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-[10px] text-gray-400">Less</span>
        {LEVELS.map((l) => (
          <div
            key={l.label}
            className={`h-[12px] w-[12px] rounded-[2px] ${l.bg}`}
            title={`${l.label} climb${l.label === "1" ? "" : "s"}`}
          />
        ))}
        <span className="text-[10px] text-gray-400">More</span>
      </div>
    </div>
  );
}
