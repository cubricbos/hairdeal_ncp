import axios from 'axios';
async function test() {
  try {
    const r = await axios.post('http://localhost:3000/api/api/api/sms/verify/01012345678');
    const id = r.data.id;
    console.log('ID =', id);

    const payloads = [
       { id, code: '111111' },
       { id, verifyCode: '111111' },
       { id, otp: '111111' },
       { id, verifyNumber: '111111' },
       { verificationId: id, code: '111111' },
       { id, target: '01012345678', code: '111111' }
    ];
    
    for (const p of payloads) {
       try {
          const res = await axios.post(`http://localhost:3000/api/api/api/sms/verify/check`, p);
          console.log('Success POST check', p, res.status, res.data);
       } catch(e: any) {
          console.log('Fail POST check', p, e.response?.status, typeof e.response?.data === 'object' ? JSON.stringify(e.response?.data) : '');
       }
    }
  } catch(e: any) {
    console.log('Fail init:', e.response?.status, e.response?.data);
  }
}
test();
