import axios from 'axios';
async function test() {
  try {
    const r1 = await axios.get('http://localhost:3000/api/account/designer/find/profile', { params: { mobileNumber: '01012341234' }});
    console.log('GET profile', r1.status, r1.data);
  } catch(e: any) {
    console.log('GET profile fail', e.response?.status, e.response?.data);
  }
}
test();
