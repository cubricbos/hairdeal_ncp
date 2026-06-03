import axios from 'axios';
async function test() {
  try {
    const r = await axios.get(`http://localhost:3000/api/account/admin/designers`);
    console.log('/admin/designers:', r.status, r.data);
  } catch(e: any) {
    console.log('/admin/designers fail:', e.response?.status, e.response?.data);
  }
}
test();
