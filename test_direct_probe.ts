import axios from 'axios';
async function test() {
  const urls = [
    'http://account.cubric.io/v3/api-docs',
    'http://account.cubric.io/api/v3/api-docs',
    'http://account.cubric.io/v3/api-docs/swagger-config',
    'http://account.cubric.io/swagger-ui/index.html'
  ];
  for (const url of urls) {
    try {
      console.log('Direct GET to:', url);
      const res = await axios.get(url, { timeout: 3000 });
      console.log('Direct SUCCESS:', url, res.status);
      console.log('Sample keys:', typeof res.data === 'object' ? Object.keys(res.data) : res.data.substring(0, 200));
      if (typeof res.data === 'object' && res.data.paths) {
         console.log('Paths:', Object.keys(res.data.paths));
      }
    } catch(e: any) {
      console.log('Direct FAIL:', url, e.message);
      if (e.response) {
         console.log('Direct FAIL status:', e.response.status, 'body:', typeof e.response.data === 'string' ? e.response.data.substring(0, 300) : e.response.data);
      }
    }
  }
}
test();
