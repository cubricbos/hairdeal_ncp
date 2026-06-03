import axios from 'axios';

async function probeLogin() {
  const payloads = [
    { mobileNumber: '01011112222', verifyNumber: '123456' },
  ];
  
  const urls = [
    'http://account.cubric.io/api/account/login',
    'http://account.cubric.io/api/account/sign-in',
    'http://account.cubric.io/api/account/token',
    'http://account.cubric.io/api/auth/login',
    'http://account.cubric.io/api/auth/token',
    'http://account.cubric.io/api/public/login'
  ];

  for (const url of urls) {
      try {
        const res = await axios.post(url, payloads[0]);
        console.log('SUCCESS:', url, res.status);
      } catch (err: any) {
        console.log('FAIL:', url, err.response?.status, err.response?.data);
      }
  }
}

probeLogin();
