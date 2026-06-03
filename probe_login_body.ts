import axios from 'axios';
async function run() {
  try {
    const res = await axios.post('http://account.cubric.io/api/designer/login', { mobileNumber: '01012345678', verifyNumber: '111111' });
    console.log(`[Success] -> ${res.status}`);
  } catch(e: any) {
    console.log(`[Fail] -> ${e?.response?.status}`, e?.response?.data);
  }
}
run();
