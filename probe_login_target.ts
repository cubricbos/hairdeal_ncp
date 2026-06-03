import axios from 'axios';
async function probe() {
  const url = 'http://account.cubric.io/api/account/login';
  try {
     const res = await axios.post(url, { target: '01011112222', code: '123456' });
     console.log('SUCCESS:', res.status);
  } catch(e: any) {
     console.log('FAIL:', e.response?.status);
  }
}
probe();
