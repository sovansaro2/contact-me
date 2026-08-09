import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/rest\/v1\/?$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let isValidUrl = false;
try {
  if (supabaseUrl) {
    new URL(supabaseUrl);
    isValidUrl = true;
  }
} catch (e) {
  isValidUrl = false;
}

const hasValidConfig = 
  isValidUrl &&
  supabaseUrl !== 'https://placeholder.supabase.co' && 
  supabaseUrl !== 'your_supabase_project_url' &&
  supabaseAnonKey && 
  supabaseAnonKey !== 'placeholder-key' &&
  supabaseAnonKey !== 'your_supabase_anon_key';

// If config is invalid, we still create a client but throw meaningful errors on use
// Or we can create a dummy client that throws, but Supabase SDK will throw if URL is invalid.
// Using a dummy URL just to satisfy the constructor if missing, but we will warn heavily.
export const supabase = createClient(
  hasValidConfig ? supabaseUrl : 'https://invalid.supabase.co',
  hasValidConfig ? supabaseAnonKey : 'invalid-key'
);

if (!hasValidConfig) {
  console.warn(
    'Supabase credentials are missing or invalid. Please check your environment variables.'
  );
}

export const checkSupabaseConfig = () => {
  if (!hasValidConfig) {
    throw new Error('Supabase configuration is missing or invalid.');
  }
};
