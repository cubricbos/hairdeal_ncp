const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data } = await supabase.from('site_settings').select('*').eq('id', 'default').single();
  console.log(JSON.stringify(data, null, 2));
}
run();
