import axios from 'axios';

async function probe() {
  const url = 'http://account.cubric.io/api/designer';
  const id = Math.random().toString(16).slice(2, 34).padEnd(32, '0');
  
  const payloads = [
    {
      name: 'Test',
      email: `test${Date.now()}@example.com`,
      password: 'Password123!',
      passwordConfirm: 'Password123!',
      mobileNumber: '01012341234',
    },
    {
      id: id,
      name: 'Test ID',
      email: `test_id${Date.now()}@example.com`,
      password: 'Password123!',
      passwordConfirm: 'Password123!',
      mobileNumber: '01012345678',
    }
  ];

  for (const p of payloads) {
    try {
      console.log('Testing payload:', JSON.stringify(p, null, 2));
      const res = await axios.post(url, p);
      console.log('SUCCESS:', res.status, res.data);
    } catch (err: any) {
      console.log('FAIL:', err.response?.status, JSON.stringify(err.response?.data));
    }
  }
}

probe();
