import axios from 'axios';
async function test() {
  try {
    const res = await axios.post(`http://localhost:3000/api/account/designer/sms`, { mobileNumber: '01012345678' });
    console.log('/designer/sms:', res.status);
  } catch(e: any) {
    console.log('/designer/sms fail:', e.response?.status, e.response?.data);
  }
}
test();
