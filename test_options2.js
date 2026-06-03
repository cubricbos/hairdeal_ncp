import axios from 'axios';
async function doOptions(url) {
  try {
    const res = await axios.options(url);
    console.log(`OPTIONS ${url}:`, res.headers.allow || res.headers['allow']);
  } catch(e) {
    console.log(`OPTIONS fail ${url}:`, e.response?.status);
  }
}
async function test() {
  const base = process.env.VITE_NCP_ACCOUNT_URL || 'http://49.50.133.211:8081';
  await doOptions(`${base}/api/admin/users`);
  await doOptions(`${base}/api/admin/designers`);
  await doOptions(`${base}/api/admin/designer`);
  await doOptions(`${base}/api/designer/all`);
  await doOptions(`${base}/api/v1/admin/designers`);
}
test();
