import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_PUBLIC_TK!
);

async function checkProfiles() {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.error(error);
  } else {
    console.log('All profiles:');
    data.forEach((p: any) => {
      console.log(`- ID: ${p.id}, Email: ${p.email}, Role: ${p.role}`);
    });
  }
}

checkProfiles();
