import axios from 'axios';
async function test() {
  const url = 'http://localhost:3000/api/api/api/sms/verify';
  try {
    const r = await axios.post(url, { totallyUnknownProp: 'yes' });
    console.log('Success:', r.data);
  } catch(e: any) {
    console.log('Fail unknown prop:', e.response?.status, e.response?.data);
  }
}
test();
