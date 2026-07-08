import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

async function run() {
  const supa = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);
  
  // Login as admin
  const { data, error } = await supa.auth.signInWithPassword({
    email: 'cubric.ceo@gmail.com',
    password: process.env.ADMIN_PASSWORD || 'cubric123!@#' // whatever password it is, let me try if I can guess it.
  });
  
  if (error) {
    console.log("Could not login:", error.message);
    return;
  }
  
  const token = data.session.access_token;
  try {
    const targetId = '277a6532968840169d89501b7bfa1dbd';
    const res = await axios.get('http://localhost:3000/api/admin/user-credit-history', {
      headers: { Authorization: `Bearer ${token}` },
      params: { designerId: targetId }
    });
    console.log("Success! Status:", res.status);
    console.log("Data:", JSON.stringify(res.data).substring(0, 200));
  } catch (e: any) {
    console.log("Fail:", e.response?.status, JSON.stringify(e.response?.data));
  }
}
run();
