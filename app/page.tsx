import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-6 pt-16 text-center">
      <h1 className="text-3xl font-bold tracking-tight">Climbing Tracker</h1>
      <p className="max-w-sm text-gray-500">
        Log your climbs, review your history, and track your progress over time.
      </p>
      <div className="flex gap-3">
        <Link
          href="/log"
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
        >
          Log a climb
        </Link>
        <Link
          href="/calendar"
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          View history
        </Link>
      </div>
    </div>
  );
}
