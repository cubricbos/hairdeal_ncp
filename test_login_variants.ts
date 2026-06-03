import axios from 'axios';

async function testLogin() {
  const url = 'http://account.cubric.io/api/designer/login';
  const variants = [
    { username: 'cubric.ceo@gmail.com', password: 'password' },
    { email: 'cubric.ceo@gmail.com', password: 'password' },
    { accountId: 'cubric.ceo@gmail.com', password: 'password' },
    { id: 'cubric.ceo@gmail.com', password: 'password' },
    { loginId: 'cubric.ceo@gmail.com', password: 'password' },
  ];

  for (const v of variants) {
    try {
      console.log('Testing login variant:', Object.keys(v)[0]);
      const res = await axios.post(url, v);
      console.log('SUCCESS:', res.status);
    } catch (err: any) {
      console.log('FAIL:', Object.keys(v)[0], err.response?.status, JSON.stringify(err.response?.data));
    }
  }
}

testLogin();
