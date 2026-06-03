import axios from 'axios';
async function run() {
  const accountBase = 'http://account.cubric.io/api/designer';
  const endpoints = [
    { method: 'get', url: 'http://account.cubric.io/api/designers' },
    { method: 'post', url: 'http://account.cubric.io/api/designer/search', data: {} },
    { method: 'get', url: 'http://account.cubric.io/api/designer' },
    { method: 'post', url: 'http://account.cubric.io/api/designer/list', data: {} },
    { method: 'get', url: 'http://account.cubric.io/api/designer/list' }
  ];

  for (const ep of endpoints) {
    try {
      const res = await (axios as any)[ep.method](ep.url, ep.data);
      console.log(`[Success] ${ep.method} ${ep.url} -> ${res.status}`);
    } catch(e: any) {
      console.log(`[Fail] ${ep.method} ${ep.url} -> ${e?.response?.status}`);
    }
  }
}
run();
