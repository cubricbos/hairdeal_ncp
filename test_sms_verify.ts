import axios from 'axios';
async function test() {
  const url = 'http://localhost:3000/api/api/api/sms/verify';
  const id = '92ec4fd0b52247b799f8e43c137f4e15'; // From previous response
  
  const payloads = [
    { phoneNumber: '01012345678', code: '123456' },
    { phoneNumber: '01012345678', verifyNumber: '123456' },
    { target: '01012345678', verifyNumber: '123456' },
    { id: id, verifyNumber: '123456' },
    { otpId: id, verifyNumber: '123456' }
  ];
  
  for (const payload of payloads) {
    try {
      const r = await axios.post(url, payload);
      console.log('Success!', payload, r.data);
    } catch(e: any) {
      console.log('Fail:', payload, e.response?.status, e.response?.data);
    }
  }
}
test();
