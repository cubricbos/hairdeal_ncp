import axios from 'axios';

async function probe() {
  const url = 'http://account.cubric.io/api/designer';
  
  const p = {
    email: `nullshop${Date.now()}@example.com`,
    password: 'Password123!',
    passwordConfirm: 'Password123!',
    name: 'Null Shop Test',
    mobileNumber: '01011112222',
    role: '디자이너',
    hairShop: null,
    businessFile: null,
    businessTimes: [null, null, null, null, null, null, null],
    holidays: []
  };

  try {
    console.log('Testing with NULL hairShop:', JSON.stringify(p, null, 2));
    const res = await axios.post(url, p);
    console.log('SUCCESS:', res.status);
  } catch (err: any) {
    console.log('FAIL:', err.response?.status, JSON.stringify(err.response?.data));
  }
}

probe();
