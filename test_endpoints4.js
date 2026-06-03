import axios from 'axios';

async function test() {
  const base = process.env.VITE_NCP_ACCOUNT_URL || 'http://49.50.133.211:8081';
  
  try {
    const res = await axios.post(`${base}/api/designer/login`, {}, { timeout: 3000 });
    console.log(`POST /api/designer/login:`, res.status);
  } catch(e) {
    console.log(`POST /api/designer/login fail:`, e.response?.status, e.response?.data);
  }

  try {
    const res = await axios.post(`${base}/api/admin/login`, {}, { timeout: 3000 });
    console.log(`POST /api/admin/login:`, res.status);
  } catch(e) {
    console.log(`POST /api/admin/login fail:`, e.response?.status, e.response?.data);
  }

  try {
    const res = await axios.get(`${base}/api/admin/designers`, { timeout: 3000 });
    console.log(`GET /api/admin/designers:`, res.status);
  } catch(e) {
    console.log(`GET /api/admin/designers fail:`, e.response?.status, e.response?.data);
  }
}
test();
