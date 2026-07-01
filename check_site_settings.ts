import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_PUBLIC_TK!
);

async function checkSiteSettings() {
  const { data, error } = await supabase.from('site_settings').select('*');
  if (error) {
    console.error('Error fetching site_settings:', error);
  } else {
    console.log('Site settings count:', data.length);
    console.log('Site settings rows:', JSON.stringify(data, null, 2));
  }
}

checkSiteSettings();
