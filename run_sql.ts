import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

async function main() {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL || 'https://okiiejc7q47cn2y2rwcqcq-94346158915.asia-northeast1.run.app', // wait this is app url. I'll read .env or use service role? No wait...
    process.env.VITE_SUPABASE_ANON_KEY || ''
  );
}
main();
