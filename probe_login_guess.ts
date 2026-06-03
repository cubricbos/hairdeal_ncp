import axios from 'axios';
async function probe() {
  const url = 'http://account.cubric.io/api/account/login';
  const myMobile = '01011112222';
  
  const payloads = [
    { mobileNumber: myMobile, verifyNumber: '123456', socialLoginId: '' },
    { mobileNumber: myMobile, verifyNumber: '123456', signedBy: 'Mobile' },
    { mobileNumber: myMobile, verifyNumber: '123456', email: 'test@example.com' },
    { phone: myMobile, code: '123456' },
    { mobileNumber: myMobile, verifyNumber: '123456', loginType: 'MOBILE' }
  ];
  
  for(const p of payloads) {
      try {
         const res = await axios.post(url, p);
         console.log('SUCCESS:', p, res.status);
      } catch(e: any) {
         console.log('FAIL:', p, e.response?.status);
      }
  }
}
probe();
