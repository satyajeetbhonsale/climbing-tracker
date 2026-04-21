"use client";

import { useState, useMemo } from "react";
import type { Climb } from "@/lib/types";

const DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const disciplineLabel: Record<string, string> = {
  boulder: "Boulder",
  toprope: "Top rope",
  lead: "Lead",
};

function toIso(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatSelectedDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function CalendarView({ climbs }: { climbs: Climb[] }) {
  const todayIso = new Date().toISOString().split("T")[0];
  const todayYear = Number(todayIso.slice(0, 4));
  const todayMonth = Number(todayIso.slice(5, 7)) - 1;

  const [year, setYear] = useState(todayYear);
  const [month, setMonth] = useState(todayMonth);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, Climb[]>();
    for (const climb of climbs) {
      const arr = map.get(climb.date) ?? [];
      arr.push(climb);
      map.set(climb.date, arr);
    }
    return map;
  }, [climbs]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday-based offset: getDay() 0=Sun → offset 6, 1=Mon → 0, …
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;

  const cells: (number | null)[] = [
    ...Array<null>(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
    setSelectedDate(null);
  }
  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
    setSelectedDate(null);
  }

  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const selectedClimbs = selectedDate ? (grouped.get(selectedDate) ?? []) : [];

  return (
    <div className="flex flex-col gap-6">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          aria-label="Previous month"
        >
          ‹
        </button>
        <span className="text-base font-semibold text-gray-900">{monthLabel}</span>
        <button
          onClick={nextMonth}
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7">
        {DAY_LABELS.map((d) => (
          <div key={d} className="py-1 text-center text-xs font-medium text-gray-400">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 -mt-4">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;

          const iso = toIso(year, month, day);
          const dayClimbs = grouped.get(iso);
          const count = dayClimbs?.length ?? 0;
          const hasClimbs = count > 0;
          const isToday = iso === todayIso;
          const isSelected = iso === selectedDate;

          return (
            <button
              key={iso}
              onClick={() => setSelectedDate(isSelected ? null : iso)}
              className={[
                "relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition-colors",
                hasClimbs
                  ? isSelected
                    ? "bg-gray-700 text-white"
                    : "bg-gray-900 text-white hover:bg-gray-700"
                  : isSelected
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
              ].join(" ")}
              aria-label={`${iso}${count ? `, ${count} climb${count > 1 ? "s" : ""}` : ""}`}
            >
              <span className={isToday && !hasClimbs ? "font-bold text-gray-900" : ""}>{day}</span>
              {hasClimbs && (
                <span className="mt-0.5 text-[10px] font-medium opacity-80">
                  {count}
                </span>
              )}
              {isToday && (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-current opacity-60" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day detail */}
      {selectedDate && (
        <div className="border-t border-gray-200 pt-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {formatSelectedDate(selectedDate)}
          </h2>
          {selectedClimbs.length === 0 ? (
            <p className="text-sm text-gray-400">No climbs logged on this day.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {selectedClimbs.map((climb) => (
                <div
                  key={climb.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-gray-900">
                      {climb.name || <span className="italic text-gray-400">Unnamed</span>}
                    </span>
                    <span className="text-xs text-gray-500">
                      {disciplineLabel[climb.discipline]} · {climb.environment}
                      {climb.location ? ` · ${climb.location}` : ""}
                    </span>
                    {climb.notes && (
                      <span className="mt-1 text-xs text-gray-400">{climb.notes}</span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-3 shrink-0">
                    <span className="rounded bg-gray-900 px-2 py-0.5 text-xs font-semibold text-white">
                      {climb.grade}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        climb.is_sent ? "text-green-600" : "text-orange-500"
                      }`}
                    >
                      {climb.is_sent ? "Sent" : "Project"}
                    </span>
                    <span className="text-xs text-gray-400">{climb.attempts} att.</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
