import axios from 'axios';

async function probe() {
  const url = 'http://account.cubric.io/api/designer';
  
  const p = {
    email: `roles${Date.now()}@example.com`,
    password: 'Password123!',
    passwordConfirm: 'Password123!',
    name: 'Roles Array Test',
    mobileNumber: '01055556666',
    roles: ['디자이너']
  };

  try {
    console.log('Testing with roles (plural) array:', JSON.stringify(p, null, 2));
    const res = await axios.post(url, p);
    console.log('SUCCESS:', res.status);
  } catch (err: any) {
    console.log('FAIL:', err.response?.status, JSON.stringify(err.response?.data));
  }
}

probe();
