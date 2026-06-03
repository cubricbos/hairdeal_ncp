import axios from 'axios';

async function probe() {
  const url = 'http://account.cubric.io/api/designer';
  
  const p = {
    email: `longpw${Date.now()}@example.com`,
    password: 'LongPassword123!',
    passwordConfirm: 'LongPassword123!',
    name: 'Long PW Test',
    mobileNumber: '01022223333',
    role: '디자이너'
  };

  try {
    console.log('Testing with LONG password:', JSON.stringify(p, null, 2));
    const res = await axios.post(url, p);
    console.log('SUCCESS:', res.status);
  } catch (err: any) {
    console.log('FAIL:', err.response?.status, JSON.stringify(err.response?.data));
  }
}

probe();
