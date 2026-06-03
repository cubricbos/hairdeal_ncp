import axios from 'axios';

async function probe() {
  const url = 'http://account.cubric.io/api/designer';
  
  const p = {
    email: `date${Date.now()}@example.com`,
    password: 'Password123!',
    passwordConfirm: 'Password123!',
    name: 'Date Format Test',
    mobileNumber: '01011112222',
    role: '디자이너',
    hairShop: {
      name: 'Test',
      confirmedAt: '2026-05-29 11:00:00' // Space instead of T
    }
  };

  try {
    console.log('Testing with space-separated date:', JSON.stringify(p, null, 2));
    const res = await axios.post(url, p);
    console.log('SUCCESS:', res.status);
  } catch (err: any) {
    console.log('FAIL:', err.response?.status, JSON.stringify(err.response?.data));
  }
}

probe();
