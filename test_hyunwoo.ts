import axios from 'axios';

async function run() {
  const targetId = 'e328fcf2daa441c3a2a9ac206e0d9e0f18';
  console.log(`Querying designer info via local server for ID: ${targetId}`);
  
  // 1. Try account client proxy
  try {
    const res = await axios.get(`http://localhost:3000/api/account/designer/detail/${targetId}`);
    console.log('--- Proxied Account Service Detail ---');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err: any) {
    console.log('Proxied Account Service Detail failed:', err.message, err.response?.data);
  }

  // 2. Try core admin client proxy
  try {
    const res = await axios.get(`http://localhost:3000/api/core/admin/designer`, {
      params: { designerId: targetId }
    });
    console.log('--- Proxied Core Admin Service Detail ---');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err: any) {
    console.log('Proxied Core Admin Service Detail failed:', err.message, err.response?.data);
  }
}

run();
