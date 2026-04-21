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

interface MonthPoint {
  month: string;
  gradeIndex: number;
}

interface Props {
  points: MonthPoint[];
}

const options: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<"line">) => {
          if (ctx.parsed.y == null) return "";
          const grade = GRADES[ctx.parsed.y];
          return grade ? ` ${grade}` : "";
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

export default function GradeTrendChart({ points }: Props) {
  if (points.length === 0) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-5 shadow-sm">
        <p className="text-sm text-gray-400">No sends logged yet.</p>
      </div>
    );
  }

  const data = {
    labels: points.map((p) => p.month),
    datasets: [
      {
        data: points.map((p) => p.gradeIndex),
        borderColor: "#111827",
        backgroundColor: "#111827",
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-5 py-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">Highest grade sent over time</h3>
      <Line data={data} options={options} />
    </div>
  );
}
