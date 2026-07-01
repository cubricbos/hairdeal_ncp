import axios from 'axios';

async function run() {
  const c = axios.create({ baseURL: 'http://hairdeal.cubric.io/api' });
  try {
    const res = await c.get('/admin/designers', { params: { size: 100 } });
    console.log("Success! Designers fetched from core server:", res.data?.items || res.data);
  } catch (e: any) {
    console.error("Core server fetch failed:", e.response?.status, e.response?.data);
  }

  const accountC = axios.create({ baseURL: 'http://account.cubric.io/api' });
  try {
    const res = await accountC.get('/admin/designers', { params: { size: 100 } });
    console.log("Success! Designers fetched from account server:", res.data?.items || res.data);
  } catch (e: any) {
    console.error("Account server fetch failed:", e.response?.status, e.response?.data);
  }
}
run();
