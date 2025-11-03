// supabase-client.js

// These are your publicly safe, anonymous Supabase credentials.
const SUPABASE_URL = 'https://owenwtnzjibpzahcjzur.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93ZW53dG56amlicHphaGNqenVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNjQ5NzQsImV4cCI6MjA3Nzc0MDk3NH0.Bbm7xD-YvGUayoyCdTbaXxcA2pH-UR2LWb6t0kD9TEk';

/**
 * Creates and initializes the Supabase client.
 *
 * This code assumes the Supabase library has been loaded from the CDN,
 * which makes the global 'supabase' object available.
 */
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
