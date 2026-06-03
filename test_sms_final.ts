import axios from 'axios';
async function test() {
  try {
    const r = await axios.post('http://localhost:3000/api/api/api/sms/verify/01012345678');
    console.log('Success!', r.data);
  } catch(e: any) {
    console.log('Fail:', e.response?.status, e.response?.data);
  }
}
test();
