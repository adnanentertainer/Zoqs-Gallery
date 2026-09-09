export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function getSupabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured: NEXT_PUBLIC_SUPABASE_URL and/or " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY are missing from the environment. " +
        "Set them in .env.local (see .env.example), or call isSupabaseConfigured() " +
        "before creating a client so callers can fall back to mock data instead.",
    );
  }

  return { url, anonKey };
}
