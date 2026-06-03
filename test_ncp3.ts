import axios from 'axios';
async function test() {
  const accountBase = 'http://localhost:3000/api/account';
  try {
    const res = await axios.get(`${accountBase}/designers`);
    console.log('/designers:', res.status, res.data);
  } catch(e: any) {
    console.log('/designers failed:', e.response?.status, e.response?.data);
  }
}
test();
