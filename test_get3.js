import axios from 'axios';
async function test() {
  const base = process.env.VITE_NCP_ACCOUNT_URL || 'http://49.50.133.211:8081';
  try {
    const res = await axios.get(`${base}/api/designer/detail/list`);
    console.log(res.data);
  } catch(e) {
    console.log(e.response?.data);
  }
}
test();
