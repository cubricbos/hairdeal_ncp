import axios from 'axios';

async function main() {
  const host = 'http://hairdeal.cubric.io'; // CORE_SERVER_URL fallback
  const paths = [
    '/api/v3/api-docs',
    '/api/api-docs',
    '/api/v2/api-docs',
    '/api/swagger-ui/index.html',
    '/api/swagger-ui.html',
    '/api/faceswap/task/1',
    '/api/faceswap/status/1',
    '/api/faceswap/queue/1',
    '/api/faceswap/task',
    '/api/faceswap/status',
    '/api/faceswap/queue'
  ];

  for (const p of paths) {
    try {
      const url = `${host}${p}`;
      console.log(`Polling ${url}...`);
      const res = await axios.get(url, { timeout: 4000 });
      console.log(`Success ${p}: Status ${res.status}`);
      if (typeof res.data === 'object') {
        console.log(`Keys:`, Object.keys(res.data));
        if (res.data.paths) {
          const matched = Object.keys(res.data.paths).filter(k => k.includes('faceswap') || k.includes('task') || k.includes('status'));
          console.log(`Matched paths:`, matched);
        }
      } else {
        console.log(`HTML/String (sample):`, String(res.data).substring(0, 100));
      }
    } catch (err: any) {
      console.log(`Fail ${p}: ${err.message} (status: ${err.response?.status})`);
    }
  }
}

main();
