import { createBrowserClient } from "@supabase/ssr";

const DEFAULT_SUPABASE_URL = "https://xfqapdxeladfvivlwltp.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmcWFwZHhlbGFkZnZpdmx3bHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ4NDQ1MDksImV4cCI6MjExMDQyMDUwOX0.yksu5rQ8HVVyWcZcoWky5eH94cQCXqopsSJV8VEKbqo";

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes("placeholder") &&
    !key.includes("placeholder")
  );
}

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes("placeholder") ||
    supabaseAnonKey.includes("placeholder")
  ) {
    throw new Error(
      "Supabase credentials are missing. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel project settings or .env.local file."
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
