import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Climb, ClimbInsert } from "./types";

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase env vars not set. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local"
    );
  }
  _client = createClient(url, key);
  return _client;
}

export async function insertClimb(climb: ClimbInsert): Promise<Climb> {
  const { data, error } = await getClient()
    .from("climbs")
    .insert(climb)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Climb;
}

export async function fetchClimbs(): Promise<Climb[]> {
  const { data, error } = await getClient()
    .from("climbs")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Climb[];
}
