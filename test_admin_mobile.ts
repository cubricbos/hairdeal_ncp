import axios from 'axios';
async function test() {
  try {
    const res = await axios.get('http://localhost:3000/api/core/admin/designer', {
      params: { mobileNumber: '01088889999' }
    });
    console.log('mobile:', res.data);
  } catch(e: any) {
    console.log('mobile get failed:', e.response?.status, e.response?.data);
  }
}
test();
