import axios from 'axios';
async function probe() {
  const url = 'http://account.cubric.io/api/account/login';
  try {
     const res = await axios.post(`${url}?mobileNumber=01011112222&verifyNumber=123456`, {});
     console.log('STATUS:', res.status);
  } catch(e: any) {
     console.log('FAIL:', e.response?.status);
  }
}
probe();
