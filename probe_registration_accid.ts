import axios from 'axios';

async function probe() {
  const url = 'http://account.cubric.io/api/designer';
  
  const p = {
    accountId: `acc${Date.now()}@example.com`,
    password: 'Password123!',
    passwordConfirm: 'Password123!',
    name: 'Account ID Test',
    mobileNumber: '01066778899',
    role: '디자이너',
    hairShop: {
      name: '미등록 매장',
      number: '01000000000',
      address: '주소'
    }
  };

  try {
    console.log('Testing payload with accountId:', JSON.stringify(p, null, 2));
    const res = await axios.post(url, p);
    console.log('SUCCESS:', res.status, res.data);
  } catch (err: any) {
    console.log('FAIL:', err.response?.status, JSON.stringify(err.response?.data));
  }
}

probe();
