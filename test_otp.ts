import { supabase } from './src/supabase.js';

async function test() {
  const { data, error } = await supabase.auth.signInWithOtp({ phone: '+821088889999' });
  console.log('signInWithOtp result:', data, error);
}
test();
