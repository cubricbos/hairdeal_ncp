import axios from 'axios';
async function tryGetUrl(url) {
  try {
    const res = await axios.get(url, { timeout: 3000 });
    console.log(`GET ${url}:`, res.status);
  } catch(e) {
    console.log(`FAIL ${url}:`, e.response?.status || e.message);
  }
}
async function test() {
  const base = process.env.VITE_NCP_ACCOUNT_URL || 'http://49.50.133.211:8081';
  await tryGetUrl(`${base}/api/designer/findAll`);
  await tryGetUrl(`${base}/api/designer/find-all`);
  await tryGetUrl(`${base}/api/admin/designer/findAll`);
  await tryGetUrl(`${base}/api/admin/designers/list`);
}
test();
