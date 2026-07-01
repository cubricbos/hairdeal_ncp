import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_PUBLIC_TK!);

async function run() {
  const { data: profile, error } = await supabase.from('profiles').select('*').eq('email', 'tyhanareum@gmail.com').maybeSingle();
  console.log("tyhanareum profile detail:", profile, error);
}
run();
