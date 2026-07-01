import { createClient } from '@supabase/supabase-js';

async function main() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL!;
  const supabaseKey = process.env.VITE_SUPABASE_PUBLIC_TK!;
  const supa = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supa.from('profiles').select('*').limit(5);
  console.log("Profiles:", Object.keys(data?.[0] || {}));
}
main();
