const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://psmzhucjvmqbcqnikqxk.supabase.co';
const supabaseAnonKey = 'sb_publishable_IVl2ZxT62c2yxgc1OLgMSQ_jiX_3WNH';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.from('app_metrics').select('*').eq('id', 1).single();
  console.log('Metrics Data:', data);
  console.log('Metrics Error:', error);
}
test();
