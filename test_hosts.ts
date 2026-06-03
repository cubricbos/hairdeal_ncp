import axios from 'axios';
async function run() {
  const hosts = ['http://account.cubric.io', 'https://api.cubric.io'];
  const urls = [
       '/api/credit_history',
       '/api/credit-histories',
       '/api/credit-history',
       '/credit_history',
       '/credit_histories'
  ];
  for(let host of hosts) {
    for(let url of urls) {
       try {
         const res = await axios.get(`${host}${url}`);
         console.log(host+url, res.status);
       } catch(e: any) {
         console.log(host+url, e.response?.status || e.message);
       }
    }
  }
}
run();
