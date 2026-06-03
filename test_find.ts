import axios from 'axios';
async function test() {
  const accountBase = 'http://localhost:3000/api/account/designer';
  
  try {
    const res = await axios.post(`${accountBase}/find/profile`, { mobileNumber: '01088889999' });
    console.log('POST 01088889999:', res.status, res.data);
  } catch(e: any) {
    console.log('POST 01088889999 failed:', e.response?.status, e.response?.data);
  }

  try {
    const res = await axios.post(`${accountBase}/find/profile`, { phone: '01088889999' });
    console.log('POST phone 01088889999:', res.status, res.data);
  } catch(e: any) {
    console.log('POST phone 01088889999 failed:', e.response?.status, e.response?.data);
  }
}
test();
