import axios from 'axios';
async function test() {
  try {
    const r = await axios.post('http://localhost:3000/api/api/api/sms/verify/01012345678');
    const id = r.data.id;
    console.log('ID =', id);

    const keys1 = ['id', 'logId', 'verificationId', 'verifyId', 'sessionId'];
    const keys2 = ['phone', 'phoneNumber', 'mobileNumber', 'target'];
    const keys3 = ['code', 'verifyCode', 'verifyNumber', 'authCode', 'value'];
    
    // We will test some standard combinations
    const combos = [
       { id, phoneNumber: '01012345678', verifyNumber: '111111' },
       { id, mobileNumber: '01012345678', verifyCode: '111111' },
       { id, target: '01012345678', verifyCode: '111111' },
       { phone: '01012345678', code: '111111' },
       { mobileNumber: '01012345678', verifyCode: '111111' },
       { mobileNumber: '01012345678', code: '111111' },
       { target: '01012345678', code: '111111' },
       { phoneNumber: '01012345678', code: '111111' },
       { verifyId: id, mobileNumber: '01012345678', verifyCode: '111111' },
    ];
    
    for (const p of combos) {
       try {
          const res = await axios.post(`http://localhost:3000/api/api/api/sms/verify/check`, p);
          console.log('Success POST check', p, res.status, res.data);
       } catch(e: any) {
          console.log('Fail POST check', p, e.response?.status); //, typeof e.response?.data === 'object' ? JSON.stringify(e.response?.data) : '');
       }
    }
  } catch(e: any) {
    console.log('Fail init:', e.response?.status, e.response?.data);
  }
}
test();
