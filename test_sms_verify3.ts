import axios from 'axios';
async function test() {
  const url = 'http://localhost:3000/api/api/api/sms/verify';
  
  try {
    await axios.post(url, {});
  } catch(e: any) {
    console.log('Empty response:', e.response?.data);
  }
}
test();
