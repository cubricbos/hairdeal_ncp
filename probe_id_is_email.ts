import axios from 'axios';

async function probe() {
  const url = 'http://account.cubric.io/api/designer';
  
  const id = `id${Date.now()}@example.com`;
  const p = {
    id: id,
    email: id,
    password: 'Password123!',
    passwordConfirm: 'Password123!',
    name: 'ID is Email Test',
    mobileNumber: '01011112222',
    role: '디자이너'
  };

  try {
    console.log('Testing with id equal to email:', JSON.stringify(p, null, 2));
    const res = await axios.post(url, p);
    console.log('SUCCESS:', res.status);
  } catch (err: any) {
    console.log('FAIL:', err.response?.status, JSON.stringify(err.response?.data));
  }
}

probe();
