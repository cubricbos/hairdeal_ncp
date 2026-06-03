import axios from 'axios';

async function probe() {
  const url = 'http://account.cubric.io/api/designer';
  
  const p = {
    designer: {
      email: `wrap${Date.now()}@example.com`,
      password: 'Password123!',
      passwordConfirm: 'Password123!',
      name: 'Wrapped Test',
      mobileNumber: '01011112233',
      role: '디자이너'
    }
  };

  try {
    console.log('Testing with wrapped "designer" object:', JSON.stringify(p, null, 2));
    const res = await axios.post(url, p);
    console.log('SUCCESS:', res.status);
  } catch (err: any) {
    console.log('FAIL:', err.response?.status, JSON.stringify(err.response?.data));
  }
}

probe();
