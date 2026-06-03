import axios from 'axios';

async function testLoginCorrectEmail() {
  const url = 'http://account.cubric.io/api/designer/login';
  const email = 'jejjdawn@gmail.com';
  
  const variants = [
    { email, password: 'wrong' },
    { accountId: email, password: 'wrong' },
    { username: email, password: 'wrong' },
  ];

  for (const v of variants) {
    try {
      console.log('Testing login variant with real email:', Object.keys(v)[0]);
      const res = await axios.post(url, v);
      console.log('SUCCESS:', res.status);
    } catch (err: any) {
      console.log('FAIL:', Object.keys(v)[0], err.response?.status, JSON.stringify(err.response?.data));
    }
  }
}

testLoginCorrectEmail();
