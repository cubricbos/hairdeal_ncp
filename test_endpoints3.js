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
  console.log('Base:', base);
  await tryGetUrl(`${base}/api/v1/designer`);
  await tryGetUrl(`${base}/api/v1/designers`);
  await tryGetUrl(`${base}/api/account/designer`);
  await tryGetUrl(`${base}/api/account/designers`);
  await tryGetUrl(`${base}/swagger-ui.html`);
  await tryGetUrl(`${base}/v3/api-docs`);
}
test();
