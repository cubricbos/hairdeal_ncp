import axios from 'axios';
async function test() {
  try {
    const r = await axios.post('http://localhost:3000/api/api/api/sms/verify/01012345678');
    const id = r.data.id;
    console.log('ID =', id);

    const eps = [
      `http://localhost:3000/api/api/api/sms/verify/${id}`,
      `http://localhost:3000/api/api/api/sms/verify?id=${id}&code=111111`,
      `http://localhost:3000/api/api/api/sms/verify?id=${id}&verifyCode=111111`,
      `http://localhost:3000/api/api/api/sms/verify?id=${id}&verifyNumber=111111`,
      `http://localhost:3000/api/api/api/sms/verify?phoneNumber=01012345678&code=111111`,
      `http://localhost:3000/api/api/api/sms/verify/${id}?code=111111`,
      `http://localhost:3000/api/api/api/sms/verify/${id}?verifyCode=111111`,
      `http://localhost:3000/api/api/api/sms/verify/check?id=${id}&code=111111`
    ];

    for (const ep of eps) {
       try {
         const res = await axios.get(ep);
         console.log('GET Success!', ep, res.status);
       } catch(e: any) {
         console.log('GET Fail:', ep, e.response?.status, e.response?.data);
       }
    }
  } catch(e: any) {
    console.log('Fail:', e.response?.status, e.response?.data);
  }
}
test();
