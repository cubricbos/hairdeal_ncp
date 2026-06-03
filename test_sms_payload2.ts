import axios from 'axios';
async function test() {
  try {
    const r = await axios.post('http://localhost:3000/api/api/api/sms/verify/01012345678');
    const id = r.data.id;
    console.log('ID =', id);
    const testCases = [
      { id, phone: '01012345678', code: '111111' },
      { id, target: '01012345678', code: '111111' },
      { id, phoneNumber: '01012345678', verifyNumber: '111111' },
      { target: '01012345678', code: '111111' },
      { mobileNumber: '01012345678', code: '111111' },
    ];
    
    for (const payload of testCases) {
      try {
        const v = await axios.post('http://localhost:3000/api/api/api/sms/verify', payload);
        console.log('Success!', payload, v.status);
      } catch(e: any) {
        console.log('Fail:', payload, e.response?.status, e.response?.data);
      }
    }
  } catch(e: any) {
    console.log('Fail:', e.response?.status, e.response?.data);
  }
}
test();
