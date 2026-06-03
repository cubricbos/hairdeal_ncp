import axios from 'axios';

async function probe() {
  const url = 'http://account.cubric.io/api/designer';
  
  const p = {
    email: `pw${Date.now()}@example.com`,
    password: 'Password123!',
    password_confirm: 'Password123!',
    name: 'PW Confirm Test',
    mobileNumber: '01011119999',
    role: '디자이너'
  };

  try {
    console.log('Testing with password_confirm (underscore):', JSON.stringify(p, null, 2));
    const res = await axios.post(url, p);
    console.log('SUCCESS:', res.status);
  } catch (err: any) {
    console.log('FAIL:', err.response?.status, JSON.stringify(err.response?.data));
  }
}

probe();
