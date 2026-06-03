import axios from 'axios';
async function test() {
  const url = 'http://localhost:3000/api/api/api/sms/verify';
  try {
    const r = await axios.post(url, { });
  } catch(e: any) {
    console.log('Fail:', JSON.stringify(e.response?.data, null, 2));
  }
}
test();
