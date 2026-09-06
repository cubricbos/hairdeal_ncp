import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KY;
const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'default').single();
  console.log('Error:', error);
  console.log('Data:', data ? 'Exists' : 'Null');
  if (data) {
    console.log(JSON.stringify(data, null, 2).substring(0, 500));
  }
}

test();
