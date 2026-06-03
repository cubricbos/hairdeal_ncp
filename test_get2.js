import axios from 'axios';
async function test() {
  const base = process.env.VITE_NCP_ACCOUNT_URL || 'http://49.50.133.211:8081';
  const tryGet = async (u) => {
    try { const res = await axios.get(base + u); console.log('✅ ' + u); } catch(e) { console.log('❌ ' + u + " " + e.response?.status); }
  }
  const tryOptions = async (u) => {
    try { const res = await axios.options(base + u); console.log('✅ ' + u + ' OPTIONS: ' + res.headers.allow); } catch(e) { console.log('❌ ' + u + " OPTIONS " + e.response?.status); }
  }
  
  await tryGet('/api/designer/find/all');
  await tryGet('/api/designer/all');
  await tryGet('/api/designer/profiles');
  await tryOptions('/api/designer/find/all');
  await tryGet('/api/designer/detail/list');
}
test();
