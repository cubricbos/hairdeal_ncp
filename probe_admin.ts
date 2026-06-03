import axios from 'axios';
async function run() {
  try {
     const res = await axios.post('http://account.cubric.io/api/admin/login', {
       accountId: 'cubric1',
       password: 'password'
     });
     console.log(res.data);
  } catch(e: any) {
     console.log("login failed", e.response?.data);
  }
}
run();
