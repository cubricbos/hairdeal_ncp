import axios from 'axios';
async function test() {
  const base = process.env.VITE_NCP_ACCOUNT_URL || 'http://49.50.133.211:8081';
  const tryGet = async (u) => {
    try { const res = await axios.get(base + u); console.log('✅ ' + u); } catch(e) { console.log('❌ ' + u + " " + e.response?.status); }
  }
  await tryGet('/api/designers/list');
  await tryGet('/api/admin/list');
  await tryGet('/api/manager/designers');
  await tryGet('/api/designer/search');
  await tryGet('/api/search/designer');
}
test();
