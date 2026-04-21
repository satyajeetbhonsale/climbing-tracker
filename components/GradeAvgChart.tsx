"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  type ChartOptions,
  type TooltipItem,
} from "chart.js";
import { GRADES } from "@/lib/constants";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export interface AvgPoint {
  month: string;
  avgAttempted: number;
  avgSent: number | null;
}

interface Props {
  points: AvgPoint[];
}

function gradeLabel(value: number): string {
  const rounded = Math.round(value);
  return GRADES[Math.max(0, Math.min(rounded, GRADES.length - 1))] ?? "";
}

const options: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        boxWidth: 12,
        boxHeight: 2,
        padding: 16,
        font: { size: 12 },
        color: "#6b7280",
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<"line">) => {
          if (ctx.parsed.y == null) return "";
          return ` ${ctx.dataset.label ?? ""}: ${gradeLabel(ctx.parsed.y)}`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 }, color: "#9ca3af" },
      border: { display: false },
    },
    y: {
      min: 0,
      max: GRADES.length - 1,
      grid: { color: "#f3f4f6" },
      border: { display: false },
      ticks: {
        font: { size: 11 },
        color: "#9ca3af",
        stepSize: 1,
        callback: (value) => GRADES[value as number] ?? "",
      },
    },
  },
};

export default function GradeAvgChart({ points }: Props) {
  if (points.length === 0) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-5 shadow-sm">
        <p className="text-sm text-gray-400">Not enough data yet.</p>
      </div>
    );
  }

  const data = {
    labels: points.map((p) => p.month),
    datasets: [
      {
        label: "Avg attempted",
        data: points.map((p) => p.avgAttempted),
        borderColor: "#6b7280",
        backgroundColor: "#6b7280",
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
        tension: 0.3,
        spanGaps: true,
      },
      {
        label: "Avg sent",
        data: points.map((p) => p.avgSent),
        borderColor: "#111827",
        backgroundColor: "#111827",
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
        tension: 0.3,
        spanGaps: false,
      },
    ],
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-5 py-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">
        Average grade attempted vs sent
      </h3>
      <Line data={data} options={options} />
    </div>
  );
}
