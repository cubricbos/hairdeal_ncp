import axios from 'axios';
async function test() {
  const accountBase = 'http://localhost:3000/api/account/designer';
  const payloads = [
    { email: 'abc@abc.com', password: 'abc' },
    { username: 'abc', password: 'abc' },
    { id: 'abc', password: 'abc' },
    { phone: '01012345678', password: 'abc' },
    { mobileNumber: '01012345678', smsLoginCode: '123' },
    { mobileNumber: '01012345678' }
  ];
  for (const p of payloads) {
    try {
      const res = await axios.post(`${accountBase}/login`, p);
      console.log('Login success for payload:', p, res.status);
    } catch(e: any) {
      console.log('Login FAIL for payload:', p, e.response?.status, e.response?.data);
    }
  }
}
test();
