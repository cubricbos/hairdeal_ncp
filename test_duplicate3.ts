import axios from 'axios';
async function test() {
  const accountBase = 'http://localhost:3000/api/account/designer';
  const paylaods = [
    { phone: '01012345678', password: 'abc' },
    { phoneNumber: '01012345678', password: 'abc' },
    { contact: '01012345678', password: 'abc' }
  ];
  for (const p of paylaods) {
    try {
      const res = await axios.post(`${accountBase}/login`, p);
      console.log('Login success:', p);
    } catch(e: any) {
      console.log('Login error for', p, e.response?.status, e.response?.data?.message || e.response?.data?.error);
    }
  }
}
test();
