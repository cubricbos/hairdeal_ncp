const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://psmzhucjvmqbcqnikqxk.supabase.co';
const supabaseAnonKey = 'sb_publishable_IVl2ZxT62c2yxgc1OLgMSQ_jiX_3WNH';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'default').single();
  console.log('Error:', error);
  console.log('Data:', data ? 'Exists' : 'Null');
}
test();
