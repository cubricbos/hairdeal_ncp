import axios from 'axios';
async function test() {
  try {
     const eps = [
       `http://localhost:3000/api/api/api/sms/verify/01012345678?code=111111`,
       `http://localhost:3000/api/api/api/sms/verify/01012345678?verifyCode=111111`,
       `http://localhost:3000/api/api/api/sms/verify/01012345678?verifyNumber=111111`,
       `http://localhost:3000/api/api/api/sms/verify/01012345678?otp=111111`,
     ];
     for (const ep of eps) {
        try {
           const res = await axios.get(ep);
           console.log('GET', ep, 'Success', res.status, res.data);
        } catch(e: any) {
           console.log('GET', ep, 'Fail', e.response?.status, typeof e.response?.data === 'object' ? JSON.stringify(e.response?.data) : '');
        }
     }
  } catch(e) {}
}
test();
