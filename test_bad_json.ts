import axios from 'axios';
async function test() {
  try {
     const r = await axios.post('http://localhost:3000/api/api/api/sms/verify', 'bad json {', {
       headers: { 'Content-Type': 'application/json' }
     });
     console.log('Success:', r.data);
  } catch(e: any) {
     console.log('Bad JSON ERR:', e.response?.status, e.response?.data);
  }
}
test();
