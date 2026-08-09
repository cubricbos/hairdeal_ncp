import axios from 'axios';

async function run() {
  try {
    const coreUrl = 'http://hairdeal.cubric.io';
    const listRes = await axios.get(`${coreUrl}/api/admin/designers?page=0&size=1000`, {
      timeout: 8000,
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(listRes.status, listRes.data);
  } catch(e) {
    console.log(e.response?.status, e.response?.data);
  }
}
run();
