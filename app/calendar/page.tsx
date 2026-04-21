export const dynamic = "force-dynamic";

import { fetchClimbs } from "@/lib/supabase";
import CalendarView from "@/components/CalendarView";
import Link from "next/link";
import type { Climb } from "@/lib/types";

export default async function CalendarPage() {
  let climbs: Climb[] = [];
  let fetchError = "";

  try {
    climbs = await fetchClimbs();
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to load climbs";
  }

  if (fetchError) {
    return (
      <div className="mx-auto max-w-lg">
        <h1 className="mb-4 text-xl font-semibold">Calendar</h1>
        <p className="text-sm text-red-600">{fetchError}</p>
      </div>
    );
  }

  if (climbs.length === 0) {
    return (
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 text-xl font-semibold">Calendar</h1>
        <p className="text-sm text-gray-500">
          No climbs yet.{" "}
          <Link href="/log" className="underline">
            Log your first climb
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-xl font-semibold">Calendar</h1>
      <CalendarView climbs={climbs} />
    </div>
  );
}
