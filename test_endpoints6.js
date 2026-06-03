import axios from 'axios';
async function test() {
  const base = process.env.VITE_NCP_ACCOUNT_URL || 'http://49.50.133.211:8081';
  try {
    const res = await axios.get(`${base}/api/designer/detail/abc`);
    console.log(`GET /api/designer/detail:`, res.status);
  } catch(e) {
    console.log(`GET /api/designer/detail fail:`, e.response?.status, e.response?.data);
  }
}
test();
