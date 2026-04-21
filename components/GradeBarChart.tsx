"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { GRADES, type Grade } from "@/lib/constants";

interface Props {
  counts: Record<Grade, number>;
  title?: string;
}

export default function GradeBarChart({ counts, title = "Climbs by grade" }: Props) {
  const data = GRADES.map((grade) => ({ grade, count: counts[grade] }));

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-5 py-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">{title}</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#f0f0f0" />
          <XAxis
            dataKey="grade"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "#f3f4f6" }}
            contentStyle={{
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              fontSize: "12px",
              padding: "6px 10px",
            }}
            formatter={(value) => [String(value ?? ""), "climbs"]}
          />
          <Bar dataKey="count" fill="#111827" radius={[3, 3, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
