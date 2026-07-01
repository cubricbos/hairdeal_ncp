import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_PUBLIC_TK!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: tables, error } = await supabase.rpc('get_tables' as any); // just query maybe
  console.log(tables, error);
}
main();
