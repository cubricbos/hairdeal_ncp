import axios from 'axios';
const eps = [
  '/v3/api-docs',
  '/api/v3/api-docs',
  '/api-docs',
  '/api/api-docs',
  '/swagger-ui/index.html',
  '/api/swagger-ui/index.html'
];
async function run() {
  for (const ep of eps) {
    try {
       const res = await axios.get('http://account.cubric.io' + ep);
       console.log('Success:', ep);
       if (typeof res.data === 'object') {
          const keys = Object.keys(res.data.paths);
          console.log(keys.filter(k => k.includes('designer') || k.includes('sign')));
       }
    } catch(e) {}
  }
}
run();
