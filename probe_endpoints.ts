import axios from 'axios';

async function probe() {
  const endpoints = [
    '/api/designer',
    '/api/designer/register',
    '/api/designer/signup',
    '/api/signup',
    '/api/auth/signup',
    '/api/register',
  ];
  
  const p = {
    email: `ep${Date.now()}@example.com`,
    password: 'Password123!',
    passwordConfirm: 'Password123!',
    name: 'Endpoint Test',
    mobileNumber: '01012123434',
    role: '디자이너'
  };

  for (const ep of endpoints) {
    try {
      const url = `http://account.cubric.io${ep}`;
      console.log('Testing endpoint:', url);
      const res = await axios.post(url, p);
      console.log('SUCCESS:', res.status);
      return;
    } catch (err: any) {
      console.log('FAIL:', ep, err.response?.status);
    }
  }
}

probe();
