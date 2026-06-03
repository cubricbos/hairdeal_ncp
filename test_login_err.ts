import axios from 'axios';
async function test() {
  const accountBase = 'http://localhost:3000/api/account/designer';
  try {
    const res = await axios.post(`${accountBase}/login`, { mobileNumber: '01012345678', password: 'abc' });
    console.log('Login success:', res.data);
  } catch(e: any) {
    console.log('Login error:', e.response?.status, JSON.stringify(e.response?.data, null, 2));
  }
}
test();
