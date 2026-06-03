import axios from 'axios';
async function test() {
  try {
    const r = await axios.post('http://localhost:3000/api/api/api/sms/verify/01012345678');
    const id = r.data.id;
    console.log('ID =', id);

    const qs = ['code', 'verifyCode', 'verifyNumber', 'number', 'token', 'value', 'otp'];
    for (const q of qs) {
       try {
          const url = `http://localhost:3000/api/api/api/sms/verify/${id}?${q}=111111`;
          const res = await axios.post(url);
          console.log('Success POST', url, res.status, res.data);
       } catch(e: any) {
          console.log('Fail POST', q, e.response?.status, typeof e.response?.data === 'object' ? JSON.stringify(e.response?.data) : '');
       }
    }
  } catch(e: any) {
    console.log('Fail init:', e.response?.status, e.response?.data);
  }
}
test();
