import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  try {
     const res = await axios.post('http://account.cubric.io/api/admin/login', {
       accountId: process.env.VITE_TEST_ACCOUNT || 'admin',
       password: process.env.VITE_TEST_PASSWORD || 'admin'
     });
     console.log(res.data);
  } catch(e: any) {
     console.log(e.message, e.response?.data);
  }
}
run();
