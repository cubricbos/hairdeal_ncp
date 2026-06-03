import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = (process.env.VITE_SUPABASE_ANON_KY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLIC_TK)!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: profiles, error } = await supabase.from('profiles').select('*').limit(5);
  
  if (error) {
    console.error('Error fetching profiles:', error);
  } else {
    console.log('Sample profiles:', profiles);
  }
}
main();
