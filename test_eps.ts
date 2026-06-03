import axios from 'axios';
async function test() {
  const accountBase = 'http://localhost:3000/api/account';
  
  const eps = [
    `${accountBase}/designer/check`,
    `${accountBase}/designer/duplicate`,
    `${accountBase}/auth/check`,
    `${accountBase}/designer/check-email`,
  ];
  const payload = { email: 'qwe@example.com', mobileNumber: '01012345678' };

  for (const ep of eps) {
    try {
      const r = await axios.post(ep, payload);
      console.log('Success POST:', ep, r.status);
    } catch(e: any) {
      console.log('Fail POST:', ep, e.response?.status);
    }
  }
}
test();
