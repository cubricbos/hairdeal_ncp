import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_PUBLIC_TK!);
async function run() {
  const { data } = await supabase.from('profiles').select('*');
  console.log("Supabase profiles:", data?.map(d => ({id: d.id, full_name: d.full_name, email: d.email})));
}
run();
