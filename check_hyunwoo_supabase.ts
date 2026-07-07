import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_PUBLIC_TK!
);

async function main() {
  const targetId = 'e328fcf2-daa4-41c3-a2a9-ac206e0d9e0f';
  const { data, error } = await supabase.from('profiles').select('*').eq('id', targetId);
  if (error) {
    console.error(error);
  } else {
    console.log('Lee Hyun-woo profile in Supabase:');
    console.log(JSON.stringify(data, null, 2));
  }
}

main();
