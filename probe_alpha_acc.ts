import axios from 'axios';

async function probe() {
  const url = 'http://account.cubric.io/api/designer';
  
  const p = {
    accountId: `user${Date.now()}`,
    password: 'Password123!',
    passwordConfirm: 'Password123!',
    name: 'Minimal Test',
    role: '디자이너'
  };

  try {
    console.log('Testing with alphanumeric accountId:', JSON.stringify(p, null, 2));
    const res = await axios.post(url, p);
    console.log('SUCCESS:', res.status);
  } catch (err: any) {
    console.log('FAIL:', err.response?.status, JSON.stringify(err.response?.data));
  }
}

probe();
