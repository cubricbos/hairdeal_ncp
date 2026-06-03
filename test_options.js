import axios from 'axios';
async function test() {
  const base = process.env.VITE_NCP_ACCOUNT_URL || 'http://49.50.133.211:8081';
  try {
    const res = await axios.options(`${base}/api/designer`);
    console.log(`OPTIONS /api/designer:`, res.headers.allow || res.headers['allow']);
  } catch(e) {
    console.log(`OPTIONS /api/designer fail`);
  }
}
test();
