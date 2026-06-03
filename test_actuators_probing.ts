import axios from 'axios';

async function run() {
  const hosts = [
    'http://localhost:3000/api/account',
    'http://localhost:3000/api/core',
  ];

  const paths = [
    '/actuator',
    '/actuator/health',
    '/actuator/mappings',
    '/actuator/env',
    '/actuator/configprops',
    '/api-docs',
    '/api/api-docs'
  ];

  for (const host of hosts) {
    for (const path of paths) {
      const url = `${host}${path}`;
      try {
        console.log(`Checking ${url}...`);
        const res = await axios.get(url, { timeout: 2000 });
        console.log(` -> SUCCESS Status ${res.status}:`, typeof res.data === 'object' ? Object.keys(res.data) : String(res.data).substring(0, 100));
        if (path === '/actuator/mappings') {
          console.log(`Mappings data:`, JSON.stringify(res.data, null, 2).substring(0, 2000));
        }
      } catch (e: any) {
        // console.log(` -> FAIL: ${e.message}`);
      }
    }
  }
}
run();
