// Task T018: Create lib/supabase.ts with Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Environment variables from .env file
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file contains EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY'
  );
}

// Create and export Supabase client instance
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // MVP: No authentication, but keep config for future enhancement
    persistSession: false,
  },
  realtime: {
    // Enable realtime for bid updates
    params: {
      eventsPerSecond: 10,
    },
  },
});
