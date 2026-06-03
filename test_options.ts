import axios from 'axios';
async function test() {
  try {
     const r = await axios.options('http://localhost:3000/api/api/api/sms/verify');
     console.log('OPTIONS:', r.headers);
  } catch(e: any) {
     console.log('OPTIONS ERR:', e.response?.headers);
  }
}
test();
