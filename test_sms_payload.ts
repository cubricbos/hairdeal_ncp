import axios from 'axios';
async function test() {
  try {
    const r = await axios.post('http://localhost:3000/api/api/api/sms/verify/01012345678');
    const id = r.data.id;
    const testCases = [
      { id, phone: '01012345678', code: '111111' },
      { id, phoneNumber: '01012345678', code: '111111' },
      { id, target: '01012345678', code: '111111' },
      { id, mobileNumber: '01012345678', code: '111111' },
      { id, phone: '01012345678', verifyCode: '111111' },
      { id, phoneNumber: '01012345678', verifyCode: '111111' },
      { id, target: '01012345678', verifyCode: '111111' },
      { id, mobileNumber: '01012345678', verifyCode: '111111' },
      { id, phone: '01012345678', verifyNumber: '111111' },
      { id, phoneNumber: '01012345678', verifyNumber: '111111' },
      { id, target: '01012345678', verifyNumber: '111111' },
      { id, mobileNumber: '01012345678', verifyNumber: '111111' },
      { verificationId: id, target: '01012345678', code: '111111' },
      { id, target: '01012345678', number: '111111' },
      { phone: '01012345678', code: '111111' },
      { target: '01012345678', code: '111111' }
    ];
    
    for (const payload of testCases) {
      try {
        const v = await axios.post('http://localhost:3000/api/api/api/sms/verify', payload);
        console.log('Success!', payload);
      } catch(e: any) {
         if (e.response?.status !== 400 || e.response?.data?.message) {
            console.log('Got non-400 or payload error:', payload, e.response?.status, e.response?.data);
         }
      }
    }
  } catch(e: any) {
    console.log('Fail:', e.response?.status, e.response?.data);
  }
}
test();
