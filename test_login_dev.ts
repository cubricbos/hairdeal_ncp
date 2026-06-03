import axios from 'axios';

async function testLoginRealUser() {
  const url = 'http://account.cubric.io/api/designer/login';
  const email = 'dev@cubric.io';
  
  try {
    console.log('Testing login for dev@cubric.io...');
    const res = await axios.post(url, { email, password: 'wrong' });
    console.log('SUCCESS?:', res.status);
  } catch (err: any) {
    console.log('RESULT:', err.response?.status, JSON.stringify(err.response?.data));
  }
}

testLoginRealUser();
