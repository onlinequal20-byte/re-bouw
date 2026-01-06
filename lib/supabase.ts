import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseKey) {
  throw new Error('Missing Supabase key (SERVICE_ROLE_KEY or ANON_KEY)');
}

// Create a single supabase client for interacting with your database
// Use service role key for admin operations (bypasses RLS)
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});


