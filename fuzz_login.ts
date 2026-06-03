import axios from 'axios';

async function fuzzLogin() {
  const url = 'http://account.cubric.io/api/account/login';
  
  const bodies = [
    { email: 'jejjdawn@gmail.com', password: 'password' },
    { email: 'jejjdawn@gmail.com', mobileNumber: '01011112222' },
    { loginId: '01011112222', password: 'password' },
    { mobileNumber: '01011112222', verifyNumber: '123456' },
  ];

  for (let i = 0; i < bodies.length; i++) {
      try {
        const res = await axios.post(url, bodies[i]);
        console.log('SUCCESS:', i, res.status);
      } catch (err: any) {
        console.log('FAIL:', i, err.response?.status, err.response?.data);
      }
  }
}

fuzzLogin();
