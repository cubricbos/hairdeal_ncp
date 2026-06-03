import axios from 'axios';
async function probe() {
  const url = 'http://account.cubric.io/api/account/login';
  const myMobile = '01011112222';
  try {
     const res = await axios.post(url, {
         mobileNumber: myMobile,
         verifyNumber: 123456
     });
     console.log('SUCCESS:', res.status);
  } catch(e: any) {
     console.log('FAIL:', e.response?.status);
  }
}
probe();
