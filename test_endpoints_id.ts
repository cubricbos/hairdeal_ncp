import axios from 'axios';
async function run() {
  const urls = [
       '/api/admin/designer/1/credit_history',
       '/api/admin/designer/1/credit-histories',
       '/api/designer/1/credit_history',
       '/api/designer/1/credit-histories',
       '/api/credit_history/1',
       '/api/credit_histories'
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
