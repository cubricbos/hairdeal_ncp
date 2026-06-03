import axios from 'axios';
async function run() {
  const eps = [
    'http://localhost:3000/api/account/v3/api-docs',
    'http://localhost:3000/api/account/v3/api-docs/swagger-config',
    'http://localhost:3000/api/account/swagger-ui/index.html'
  ];
  for (const ep of eps) {
    try {
      console.log('Sending GET to', ep);
      const res = await axios.get(ep, { timeout: 3000 });
      console.log('SUCCESS status:', res.status);
      console.log('Data sample:', typeof res.data === 'string' ? res.data.substring(0, 200) : Object.keys(res.data));
      if (typeof res.data === 'object' && res.data.paths) {
        console.log('Paths:', Object.keys(res.data.paths));
      }
    } catch (e: any) {
      console.log('FAILED endpoint:', ep);
      console.log('Message:', e.message);
      if (e.response) {
        console.log('Status:', e.response.status);
        console.log('Body:', typeof e.response.data === 'string' ? e.response.data.substring(0, 300) : e.response.data);
      }
    }
  }
}
run();
