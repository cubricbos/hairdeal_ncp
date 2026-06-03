import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_PUBLIC_TK!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) {
    console.error('Error fetching profiles:', error);
  } else if (data && data.length > 0) {
    console.log('Columns in public.profiles:', Object.keys(data[0]));
  } else {
    console.log('No profiles found or table is empty.');
  }
}
main();
