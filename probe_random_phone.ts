import axios from 'axios';

async function probe() {
  const url = 'http://account.cubric.io/api/designer';
  
  const randNum = Math.floor(10000000 + Math.random() * 90000000); // 8 digits
  const mobileNumber = `010${randNum}`;
  const p = {
    email: `random${Date.now()}@example.com`,
    password: 'Password123!',
    passwordConfirm: 'Password123!',
    name: 'Random Phone Test',
    mobileNumber: mobileNumber,
    role: '디자이너'
  };

  try {
    console.log('Testing with RANDOM phone:', mobileNumber);
    const res = await axios.post(url, p);
    console.log('SUCCESS:', res.status);
  } catch (err: any) {
    console.log('FAIL:', err.response?.status, JSON.stringify(err.response?.data));
  }
}

probe();
