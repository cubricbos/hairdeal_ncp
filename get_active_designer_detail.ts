import axios from 'axios';

async function run() {
  const c = axios.create({ baseURL: 'http://hairdeal.cubric.io/api' });
  const ids = [
    '213289c6bcb34908b7ad50ac6cc44048', // 지선
    '277a6532968840169d89501b7bfa1dbd', // 정훈
    'e328fcf2daa441c3a2a9ac206e0d9e0f', // 김현우
    'ac8b557e30844773985e3fa031b2dc42'  // 오믈렛
  ];

  for (const id of ids) {
    try {
      const res = await c.get('/admin/designer', { params: { designerId: id } });
      console.log(`[ID ${id}] Detail:`, res.data);
    } catch (e: any) {
      console.error(`[ID ${id}] Fail:`, e.response?.status, e.response?.data);
    }
  }
}
run();
