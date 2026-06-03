import axios from 'axios';

async function probe() {
  const url = 'http://account.cubric.io/api/account/login';
  
  const payloads = [
    { mobileNumber: '01011112222', verifyNumber: '123456', signedBy: 'Email' },
    { phone: '01011112222', verifyCode: '123456' },
    { mobileNumber: '01011112222', verifyNumber: '123456', _ignore: true },
    { email: '01011112222', password: 'password' },
    { mobileNumber: '01011112222' }
  ];

  for (const dto of payloads) {
     try {
       const res = await axios.post(url, dto);
       console.log(`LOGIN SUCCESS:`, res.status, res.data);
     } catch (err: any) {
       console.log(`LOGIN FAIL (${JSON.stringify(dto)}):`, err.response?.status, err.response?.data);
     }
  }
}
probe();
