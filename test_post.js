import axios from 'axios';
async function test() {
  const base = process.env.VITE_NCP_ACCOUNT_URL || 'http://49.50.133.211:8081';
  try {
    const res = await axios.post(`${base}/api/admin/designer/list`, {});
    console.log(`POST /api/admin/designer/list:`, res.status);
  } catch(e) {
    console.log(`POST /api/admin/designer/list fail:`, e.response?.status, e.response?.data);
  }
}
test();
