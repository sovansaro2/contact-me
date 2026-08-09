import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = (process.env.VITE_SUPABASE_URL || '').replace(/\/rest\/v1\/?$/, '');

console.log("URL:", url);

const supabase = createClient(
  url,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function check() {
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*').limit(1);
  const { data: contact, error: cError } = await supabase.from('contact_methods').select('*').limit(1);
  
  if (pError) console.error('Profiles error:', pError.message, pError);
  else console.log('Profiles table reachable:', true);

  if (cError) console.error('Contact methods error:', cError.message, cError);
  else console.log('Contact methods table reachable:', true);
}

check();
