import { supabase } from './src/supabase.js';

async function test() {
  const { data, error } = await supabase.from('profiles').select('*');
  console.log(data?.[0], error);
}
test();
