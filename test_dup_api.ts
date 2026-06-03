import axios from 'axios';
async function test() {
  try {
     const res2 = await axios.post('http://localhost:3000/api/account/designer/duplicate', { mobileNumber: '01012345678' });
     console.log('duplicate API:', res2.data);
  } catch(e: any) {
     console.log('duplicate API fail:', e.response?.status, e.response?.data);
  }
}
test();
