import axios from 'axios';
async function test() {
  const url = 'http://localhost:3000/api/api/api/sms/verify';
  const id = '92ec4fd0b52247b799f8e43c137f4e15';
  
  const payloads = [
    { target: '01012345678', code: '123456' },
    { phoneNumber: '01012345678', verifyCode: '123456' },
    { target: '01012345678', verifyCode: '123456' },
    { id: id, verifyCode: '123456' },
    { id: id, code: '123456' },
    { otpId: id, code: '123456' },
    { otpId: id, verifyCode: '123456' },
    { logId: id, code: '123456' },
    { logId: id, verifyNumber: '123456' },
    // Some endpoints use the target phone number and the number
    { phone: '01012345678', code: '123456' },
    { phone: '01012345678', verifyNumber: '123456' },
    { phone: '01012345678', verifyCode: '123456' },
    { mobileNumber: '01012345678', code: '123456' },
    { mobileNumber: '01012345678', verifyNumber: '123456' }
  ];
  
  for (const payload of payloads) {
    try {
      const r = await axios.post(url, payload);
      console.log('Success!', payload, r.data);
    } catch(e: any) {
      if (e.response?.status !== 400 || !e.response?.data?.message?.includes('Required value')) {
          console.log('Fail:', payload, e.response?.status, e.response?.data?.message || e.response?.data?.error);
      }
    }
  }
}
test();
