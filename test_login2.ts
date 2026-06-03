import axios from 'axios';
async function test() {
  const accountBase = 'http://localhost:3000/api/account/designer';
  try {
     const r1 = await axios.post(`${accountBase}/login`, { mobileNumber: '01055240912', password: 'abc' });
     console.log('Login valid phone:', r1.data);
  } catch(e: any) {
     console.log('Login valid phone FAIL:', e.response?.status, e.response?.data);
  }
  
  try {
     const r2 = await axios.post(`${accountBase}/login`, { mobileNumber: '01011112222', password: 'abc' });
     console.log('Login invalid phone:', r2.data);
  } catch(e: any) {
     console.log('Login invalid phone FAIL:', e.response?.status, e.response?.data);
  }
}
test();
