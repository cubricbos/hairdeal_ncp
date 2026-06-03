import axios from 'axios';

async function tryUrl(url) {
  try {
    const res = await axios.get(url, { timeout: 3000 });
    console.log(`Success ${url}:`, res.status, Array.isArray(res.data) ? res.data.length : (res.data.content ? res.data.content.length : Object.keys(res.data)));
  } catch(e) {
    console.log(`Fail ${url}:`, e.response?.status || e.message);
  }
}

async function test() {
  const base = process.env.VITE_NCP_ACCOUNT_URL || 'http://49.50.133.211:8081';
  await tryUrl(`${base}/designer/list`);
  await tryUrl(`${base}/designer`);
  await tryUrl(`${base}/designers`);
  await tryUrl(`${base}/admin/designer`);
  await tryUrl(`${base}/admin/account`);
  await tryUrl(`${base}/admin/accounts`);
  await tryUrl(`${base}/account`);
  await tryUrl(`${base}/accounts`);
  await tryUrl(`${base}/api/designer`);
  await tryUrl(`${base}/api/account`);
  await tryUrl(`${base}/swagger-ui/index.html`);
  await tryUrl(`${base}/v2/api-docs`);
}
test();
