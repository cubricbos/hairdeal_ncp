import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supa = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
async function test() {
  const { data, error } = await supa.from('credit_transactions').select('*').limit(1);
  console.log('credit_transactions:', error?.message || 'OK');
  
  const { data: d2, error: e2 } = await supa.from('point_history').select('*').limit(1);
  console.log('point_history:', e2?.message || 'OK');

  const { data: d3, error: e3 } = await supa.from('credit_history').select('*').limit(1);
  console.log('credit_history:', e3?.message || 'OK');
}
test();
