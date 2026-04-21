"use client";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Slice {
  label: string;
  count: number;
}

interface Props {
  title: string;
  slices: Slice[];
  colors: string[];
}

const options = {
  responsive: true,
  maintainAspectRatio: true,
  cutout: "65%",
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: {
        boxWidth: 12,
        boxHeight: 12,
        padding: 16,
        font: { size: 12 },
        color: "#6b7280",
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx: { label: string; parsed: number; dataset: { data: number[] } }) => {
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
          const pct = total > 0 ? Math.round((ctx.parsed / total) * 100) : 0;
          return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
        },
      },
    },
  },
} as const;

export default function DonutChart({ title, slices, colors }: Props) {
  const total = slices.reduce((s, d) => s + d.count, 0);

  const data = {
    labels: slices.map((s) => s.label),
    datasets: [
      {
        data: slices.map((s) => s.count),
        backgroundColor: colors,
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-5 py-5 shadow-sm">
      <div className="mb-1 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <span className="text-xs text-gray-400">{total} climbs</span>
      </div>
      <div className="mx-auto w-full max-w-[220px]">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}
