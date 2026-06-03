import axios from 'axios';
async function test() {
  try {
     const payloads = [
       { code: '111111' },
       { verifyCode: '111111' },
       { verifyNumber: '111111' },
       { otp: '111111' },
     ];
     
     for (const p of payloads) {
        try {
           const res = await axios.post(`http://localhost:3000/api/api/api/sms/verify/01012345678`, p);
           console.log('M= post P=', p, 'Success', res.status, res.data);
        } catch(e: any) {
           console.log('M= post P=', p, 'Fail', e.response?.status, typeof e.response?.data === 'object' ? JSON.stringify(e.response?.data) : '');
        }
     }
  } catch(e: any) {
    console.log('Fail init:', e.response?.status, e.response?.data);
  }
}
test();
