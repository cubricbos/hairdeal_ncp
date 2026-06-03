import axios from 'axios';
async function run() {
  const urls = [
       '/points',
       '/point-histories',
       '/credit/histories',
       '/credit-histories'
  ];
  for(let url of urls) {
     try {
       const res = await axios.get(`https://api.cubric.io${url}`);
       console.log(url, res.status);
     } catch(e: any) {
       console.log(url, e.response?.status);
     }
  }
}
run();
