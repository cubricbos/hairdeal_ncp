import axios from 'axios';

async function run() {
  const urls = [
    'http://account.cubric.io/v3/api-docs',
    'http://account.cubric.io/api/v3/api-docs',
    'http://account.cubric.io/v2/api-docs',
    'http://account.cubric.io/api/v2/api-docs',
    'http://account.cubric.io/api/swagger-resources',
    'http://account.cubric.io/swagger-resources',
    'http://account.cubric.io/swagger-ui/index.html',
    'http://hairdeal.cubric.io/v3/api-docs',
    'http://hairdeal.cubric.io/api/v3/api-docs',
    'http://hairdeal.cubric.io/v2/api-docs',
    'http://hairdeal.cubric.io/api/v2/api-docs'
  ];

  for (const url of urls) {
    try {
      const res = await axios.get(url, { timeout: 3000 });
      console.log(`SUCCESS: ${url} -> status ${res.status}`);
      if (typeof res.data === 'object') {
         console.log('Object keys of response:', Object.keys(res.data));
         if (res.data.paths) {
            console.log('Paths:', Object.keys(res.data.paths).filter(p => p.includes('admin') || p.includes('login') || p.includes('auth')));
         }
      }
    } catch (err: any) {
      console.log(`FAIL: ${url} -> status ${err.response?.status} (${err.message})`);
    }
  }
}

run();
