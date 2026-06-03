import axios from 'axios';
async function test() {
  try {
     console.log('Testing /api/api/sms/verify/01012345678 ...');
     const r1 = await axios.post('http://localhost:3000/api/api/sms/verify/01012345678');
     console.log('r1 success');
  } catch(e: any) {
     console.log('r1 failed:', e.response?.status, typeof e.response?.data === 'object' ? JSON.stringify(e.response?.data) : e.response?.data?.substring(0, 50));
  }

  try {
     console.log('Testing /api/api/api/sms/verify/01012345678 ...');
     const r2 = await axios.post('http://localhost:3000/api/api/api/sms/verify/01012345678');
     console.log('r2 success:', r2.data);
  } catch(e: any) {
     console.log('r2 failed:', e.response?.status, typeof e.response?.data === 'object' ? JSON.stringify(e.response?.data) : e.response?.data?.substring(0, 50));
  }
}
test();
