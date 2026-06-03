import axios from 'axios';

async function tryUrl(url) {
  try {
    const res = await axios.post(url, {}, { timeout: 3000 });
    console.log(`POST Success ${url}:`, res.status);
  } catch(e) {
    console.log(`POST Fail ${url}:`, e.response?.status || e.message);
  }
}

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
  await tryUrl(`${base}/designer/login`);
  await tryGetUrl(`${base}/designer/detail`);
  
  await tryGetUrl(`${base}/swagger-ui.html`);
  await tryGetUrl(`${base}/api-docs`);
}
test();
