import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://okiiejc7q47cn2y2rwcqcq-94346158915.asia-northeast1.run.app', // bad url
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function test() {
   // Assuming environment isn't set, this will fail here.
}
