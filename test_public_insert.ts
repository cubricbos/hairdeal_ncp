import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = 'https://psmzhucjvmqbcqnikqxk.supabase.co';
const key = 'sb_publishable_IVl2ZxT62c2yxgc1OLgMSQ_jiX_3WNH';

const supabase = createClient(url, key);

async function run() {
  const testUuid = '01234567-cbee-4b47-b7d8-b8af86677b9e';
  
  console.log("Testing profile insert...");
  const { data: pData, error: pError } = await supabase.from('profiles').insert([{
    id: testUuid,
    email: `test_insert_${Date.now()}@example.com`,
    full_name: '테스트삽입'
  }]);
  
  if (pError) {
    console.error("FAIL Profile insert:", pError.message, pError.details);
  } else {
    console.log("SUCCESS Profile insert:", pData);
  }

  console.log("Testing shop insert...");
  const { data: sData, error: sError } = await supabase.from('shops').insert([{
    user_id: testUuid,
    name: '테스트매장인서트',
    address: '인천 서구'
  }]);
  
  if (sError) {
    console.error("FAIL Shop insert:", sError.message, sError.details);
  } else {
    console.log("SUCCESS Shop insert:", sData);
  }
}

run();
