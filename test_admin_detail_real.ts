import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

async function main() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL!;
  const supabaseKey = process.env.VITE_SUPABASE_PUBLIC_TK!;
  const supa = createClient(supabaseUrl, supabaseKey);

  const { data: authData } = await supa.auth.signInWithPassword({
    email: 'cubric.ceo@gmail.com', 
    password: 'CbrCbr1541!!'
  });

  const token = authData?.session?.access_token;
  if (!token) {
    console.log("No token - admin login failed");
    return;
  }
  console.log("Got token length:", token.length);

  try {
    const listRes = await axios.get('http://hairdeal.cubric.io/api/admin/designers?size=5', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Designers:", listRes.data.content[0]);

    if(listRes.data.content && listRes.data.content.length > 0) {
      const id = listRes.data.content[0].id;
      const detRes = await axios.get(`http://hairdeal.cubric.io/api/admin/designer?designerId=${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Detail JSON:", JSON.stringify(detRes.data, null, 2));
    }
  } catch(e:any) {
    console.log("Err:", e.response?.status, e.response?.data);
  }
}
main();
