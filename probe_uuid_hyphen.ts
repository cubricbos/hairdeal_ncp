import axios from 'axios';

async function probe() {
  const url = 'http://account.cubric.io/api/designer';
  
  const id = '550e8400-e29b-41d4-a716-446655440000';
  const p = {
    id: id,
    email: `uuid${Date.now()}@example.com`,
    password: 'Password123!',
    passwordConfirm: 'Password123!',
    name: 'UUID with Hyphen Test',
    mobileNumber: '01011110000',
    role: '디자이너'
  };

  try {
    console.log('Testing with UUID (with hyphens):', JSON.stringify(p, null, 2));
    const res = await axios.post(url, p);
    console.log('SUCCESS:', res.status);
  } catch (err: any) {
    console.log('FAIL:', err.response?.status, JSON.stringify(err.response?.data));
  }
}

probe();
