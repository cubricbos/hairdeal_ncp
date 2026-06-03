import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log('Listing users via Supabase Admin API...');
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error listing users:', error);
  } else {
    console.log('Total auth users:', users.length);
    (users as any[]).forEach((u: any, i: number) => {
      console.log(`[${i+1}] ID: ${u.id}, Email: ${u.email}, Phone: ${u.phone}, Metadata:`, u.user_metadata);
    });
  }
}

main();
