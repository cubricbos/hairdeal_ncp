import axios from 'axios';

async function run() {
  const urls = [
    'http://49.50.133.211:8081/v3/api-docs',
    'http://49.50.133.211:8081/v2/api-docs',
    'http://49.50.133.211:8081/swagger-ui/index.html',
    'http://account.cubric.io/v3/api-docs',
    'http://account.cubric.io/v2/api-docs',
    'http://account.cubric.io/swagger-ui/index.html',
  ];

  for (const url of urls) {
    try {
      console.log(`Querying ${url}...`);
      const res = await axios.get(url);
      console.log(`[SUCCESS] ${url}: Status ${res.status}`);
      if (typeof res.data === 'object') {
        const paths = Object.keys(res.data.paths || {});
        console.log(`Paths count: ${paths.length}, sample paths:`, paths.slice(0, 10));
        if (res.data.components?.schemas) {
          console.log(`Schemas:`, Object.keys(res.data.components.schemas));
          // Log Designer schema details
          for (const key of Object.keys(res.data.components.schemas)) {
            if (key.toLowerCase().includes('designer')) {
              console.log(`Schema [${key}]:`, JSON.stringify(res.data.components.schemas[key], null, 2));
            }
          }
        }
      } else {
        console.log(`Non-JSON:`, String(res.data).substring(0, 200));
      }
    } catch (e: any) {
      console.log(`[FAILED] ${url}: ${e.message}`);
    }
  }
}

run();
