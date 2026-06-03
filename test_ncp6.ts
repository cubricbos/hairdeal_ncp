import axios from 'axios';
async function test() {
  try {
    const res = await axios.get('http://localhost:3000/api/account/designer');
    console.log('GET /designer:', res.status, res.data);
  } catch(e: any) {
    console.log('fail:', e.response?.status, e.response?.data);
  }
}
test();
