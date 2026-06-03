import axios from 'axios';
async function probe() {
  try {
      const loginRes = await axios.post('http://account.cubric.io/api/account/login', {
          mobileNumber: '010-1111-2222',
          verifyNumber: '123456'
      });
      console.log('LOGIN SUCCESS:', loginRes.status);
  } catch(e: any) {
      console.log('LOGIN FAIL:', e.response?.status, e.response?.data);
  }
}
probe();
