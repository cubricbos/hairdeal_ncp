import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_PUBLIC_TK!);

async function run() {
  const { data, error } = await supabase.from('cs_notices').select('*').limit(1);
  console.log("cs_notices schema test:", { data, error });
}
run();
