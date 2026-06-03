import axios from 'axios';
async function test() {
  try {
    const r = await axios.post('http://localhost:3000/api/api/api/sms/verify/01012345678');
    console.log('r api/api success', r.data);
  } catch(e: any) {
    console.log('r api/api failed:', e.response?.status, typeof e.response?.data === 'object' ? JSON.stringify(e.response?.data) : e.response?.data?.substring(0, 50));
  }
}
test();
