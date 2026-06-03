import axios from 'axios';

async function tryGetUrl(url) {
  try {
    const res = await axios.get(url, { timeout: 3000 });
    console.log(`GET Success ${url}:`, res.status, Array.isArray(res.data) ? res.data.length : (res.data.content ? res.data.content.length : Object.keys(res.data)));
  } catch(e) {
    console.log(`GET Fail ${url}:`, e.response?.status || e.message);
  }
}

async function test() {
  const base = process.env.VITE_NCP_ACCOUNT_URL || 'http://49.50.133.211:8081';
  await tryGetUrl(`${base}/api/designer`);
  await tryGetUrl(`${base}/api/designers`);
  await tryGetUrl(`${base}/api/designer/all`);
  await tryGetUrl(`${base}/api/designer/list`);
  await tryGetUrl(`${base}/api/admin/user`);
  await tryGetUrl(`${base}/api/admin/users`);
  await tryGetUrl(`${base}/api/admin/designer`);
  await tryGetUrl(`${base}/api/admin/designer/list`);
  await tryGetUrl(`${base}/api/admin/account/list`);
  await tryGetUrl(`${base}/api/admin/accounts`);
}
test();
