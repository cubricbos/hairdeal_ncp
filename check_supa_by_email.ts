import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = (process.env.VITE_SUPABASE_ANON_KY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLIC_TK)!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const email = 'dltpwlswkdf@gmail.com';
  console.log('Querying Supabase profiles for email:', email);
  const { data, error } = await supabase.from('profiles').select('*').eq('email', email);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Result:', data);
  }
}

main();
