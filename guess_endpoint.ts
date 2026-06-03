import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  console.log("Checking Admin Designer...");
  try {
     const urls = [
       '/admin/point-histories',
       '/admin/designer/point-histories',
       '/point-histories',
       '/points/histories',
       '/designer/point-histories',
       '/designer/point',
       '/credit-history',
       '/designer/credit',
       '/designer/credit/history',
       '/v1/point-histories',
       '/v1/designer/point-histories',
       '/admin/designer/credits',
       '/admin/credit-histories',
       '/designer/mypage/points',
       '/designer/mypage/credit',
       '/point/history',
       '/app/point-histories'
     ];

     for(let url of urls) {
        try {
          const res = await axios.get(`http://hairdeal.cubric.io${url}`);
          console.log(url, res.status);
        } catch(e: any) {
          console.log(url, e.response?.status);
        }
     }
  } catch(e: any) {
     console.log(e.message);
  }
}
run();
