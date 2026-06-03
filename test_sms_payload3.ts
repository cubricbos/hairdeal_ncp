import axios from 'axios';
async function test() {
  try {
    const r = await axios.post('http://localhost:3000/api/api/api/sms/verify/01012345678');
    const id = r.data.id;
    console.log('ID =', id);
    const testCases = [
      { id: id, phoneNumber: '01012345678', verifyNumber: '552312' },
      { id: id, phoneNumber: '01012345678', verifyCode: '552312' },
      { id: id, phone: '01012345678', code: '552312' },
      { id: id, target: '01012345678', code: '552312' },
      { id: id, target: '01012345678', verifyCode: '552312' },
      { phoneNumber: '01012345678', verifyNumber: '552312' },
      { phoneNumber: '01012345678', verifyCode: '552312' },
      { phoneNumber: '01012345678', code: '552312' },
      { target: '01012345678', verifyNumber: '552312' },
      { target: '01012345678', verifyCode: '552312' },
      { target: '01012345678', code: '552312' }
    ];
    for (const payload of testCases) {
      try {
        const v = await axios.post('http://localhost:3000/api/api/api/sms/verify', payload);
        console.log('Success!', payload);
      } catch(e: any) {
        console.log('Fail:', payload, e.response?.status, e.response?.data);
      }
    }
  } catch(e: any) {
    console.log('Fail init:', e.response?.status, e.response?.data);
  }
}
test();
