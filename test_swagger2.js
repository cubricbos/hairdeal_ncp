import axios from 'axios';

async function tryGetUrl(url) {
  try {
    const res = await axios.get(url, { timeout: 3000 });
    console.log(`GET Success ${url}:`, res.status, res.data.paths ? Object.keys(res.data.paths) : 'no paths');
  } catch(e) {
    console.log(`GET Fail ${url}:`, e.response?.status || e.message);
  }
}

async function test() {
  const base = process.env.VITE_NCP_ACCOUNT_URL || 'http://49.50.133.211:8081';
  await tryGetUrl(`${base}/api/v3/api-docs`);
  await tryGetUrl(`${base}/api/swagger-ui.html`);
  await tryGetUrl(`${base}/api-docs`);
}
test();
