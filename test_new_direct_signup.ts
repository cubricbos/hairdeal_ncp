import axios from 'axios';

async function run() {
  const accountBase = 'http://localhost:3000/api/account/designer';

  // Generate a random 32-char hex ID
  const hexId = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  
  const payload = {
    email: `test_direct_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`,
    password: 'Password123!',
    name: '테스트직접가입',
    mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
    role: '디자이너',
    hairShop: {
      name: '직접테스트매장',
      address: '인천 서구 가정동'
    }
  };

  try {
    console.log('Sending direct signup payload:', JSON.stringify(payload, null, 2));
    const res = await axios.post(accountBase, payload);
    console.log('REGISTRATION SUCCESS STATUS:', res.status);
    console.log('RESPONSE DATA:', res.data);
  } catch (e: any) {
    console.log('REGISTRATION FAILED:', e.response?.status, JSON.stringify(e.response?.data, null, 2));
  }
}

run();
