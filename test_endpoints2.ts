import axios from 'axios';
async function run() {
  const urls = [
       '/api/credit_history',
       '/api/credit_histories',
       '/api/admin/credit_history',
       '/api/admin/credit_histories',
       '/credit_history',
       '/credit_histories',
       '/api/admin/credit-histories',
       '/api/designer/credit-histories'
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
