import axios from 'axios';
async function run() {
  const urls = [
       '/api/credit-history',
       '/api/credit-histories',
       '/api/creditHistory',
       '/api/creditHistories',
       '/api/admin/credit-history',
       '/api/admin/credit-histories',
       '/api/v1/credit-history',
       '/api/v1/credit-histories',
       '/api/point-history',
       '/api/point-histories',
       '/api/designer/credit-history',
       '/api/designer/credit-histories',
       '/admin/credit-history',
       '/admin/credit-histories'
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
