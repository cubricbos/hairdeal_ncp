import axios from 'axios';
async function run() {
  const ip = '49.50.133.211';
  const ports = ['8080', '8081', '8082', '80'];
  const paths = [
    '/v3/api-docs',
    '/api/v3/api-docs',
    '/v2/api-docs',
    '/api/v2/api-docs',
    '/swagger-ui/index.html',
    '/swagger-ui.html',
    '/api/designer',
    '/api/designers'
  ];

  for (const port of ports) {
    for (const path of paths) {
      const url = `http://${ip}:${port}${path}`;
      try {
        const res = await axios.get(url, { timeout: 1500 });
        console.log(`[FOUND] ${url} : Status ${res.status}`);
      } catch (e: any) {
        if (e.response && e.response.status !== 404) {
          console.log(`[CANDIDATE] ${url} : Status ${e.response.status}`);
        }
      }
    }
  }
}
run();
