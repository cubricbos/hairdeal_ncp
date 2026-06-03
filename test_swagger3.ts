import axios from 'axios';
async function run() {
  const urls = [
       '/swagger-ui.html',
       '/swagger-ui/index.html',
       '/api/swagger-ui.html',
       '/api/swagger-ui/index.html',
       '/api/v3/api-docs',
       '/v2/api-docs',
       '/api/v2/api-docs'
  ];
  for(let url of urls) {
     try {
       const res = await axios.get(`http://hairdeal.cubric.io${url}`);
       console.log(url, res.status);
     } catch(e: any) {
       console.log(url, e.response?.status || e.message);
     }
  }
}
run();
