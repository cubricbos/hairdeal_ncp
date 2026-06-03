import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
   const { data, error } = await supabase.rpc('get_tables'); // Or try querying information_schema
   if (error) {
      console.log('Error 1:', error);
   }
   
   // Direct query to information schema using REST is blocked, but let's see what tables we know.
   // Wait, we know there's a 'shops' table.
}
test();
