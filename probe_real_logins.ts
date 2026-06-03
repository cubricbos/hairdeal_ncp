import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

async function run() {
  const supa = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);
  const { data: users } = await supa.from('profiles').select('phone').not('phone', 'is', null).limit(5);

  console.log("Found phones:", users?.map(u => u.phone));
  
  for (const u of (users || [])) {
    if (!u.phone) continue;
    try {
      const res = await axios.post('http://account.cubric.io/api/designer/login', {
        mobileNumber: u.phone,
        verifyNumber: '111111'
      });
      console.log(`Login ${u.phone} SUCCESS:`, res.status, Object.keys(res.headers));
    } catch(e: any) {
      console.log(`Login ${u.phone} FAIL:`, e?.response?.status, e?.response?.data);
    }
  }
}
run();
