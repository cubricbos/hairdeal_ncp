import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function run() {
  // We can't query profiles without auth, but we can try
  const { data, error } = await supabase.from('profiles').select('*').limit(5);
  console.log(error || data);
}
run();
