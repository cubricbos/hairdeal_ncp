import axios from 'axios';

async function run() {
  const accountBase = 'http://localhost:3000/api/account';
  const coreBase = 'http://localhost:3000/api/core';

  const testData = {
    id: 'test' + Date.now().toString(16),
    email: `test_join_${Date.now()}@example.com`,
    password: 'Password123!',
    passwordConfirm: 'Password123!',
    name: '테스터합차',
    mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
    role: '디자이너',
    hairShop: {
      name: '테스트매장',
      address: '서울 강남구'
    }
  };

  const accountEndPoints = [
    '',
    '/designer',
    '/designers',
    '/designer/join',
    '/designer/register',
    '/designer/signup',
    '/join',
    '/register',
    '/signup',
    '/auth/join',
    '/auth/register',
    '/auth/signup',
    '/auth/join/designer',
    '/auth/register/designer',
    '/auth/signup/designer',
    '/api/designer',
    '/api/designer/join'
  ];

  const coreEndPoints = [
    '',
    '/designer',
    '/designers',
    '/designer/join',
    '/designer/register',
    '/designer/signup',
    '/join',
    '/register',
    '/signup',
    '/auth/join',
    '/auth/register',
    '/auth/signup',
    '/auth/join/designer',
    '/auth/designer/join',
    '/admin/designer/create',
    '/admin/designer/add'
  ];

  console.log('--- Probing Account Endpoints via axios.post ---');
  for (const ep of accountEndPoints) {
    const url = `${accountBase}${ep}`;
    try {
      const res = await axios.post(url, testData, { timeout: 2000 });
      console.log(`[SUCCESS] Account POST ${ep} : Status ${res.status}`, JSON.stringify(res.data));
    } catch (e: any) {
      if (e.response && e.response.status !== 404) {
        console.log(`[CANDIDATE] Account POST ${ep} : Status ${e.response.status}`, JSON.stringify(e.response.data));
      }
    }
  }

  console.log('--- Probing Core Endpoints via axios.post ---');
  for (const ep of coreEndPoints) {
    const url = `${coreBase}${ep}`;
    try {
      const res = await axios.post(url, testData, { timeout: 2000 });
      console.log(`[SUCCESS] Core POST ${ep} : Status ${res.status}`, JSON.stringify(res.data));
    } catch (e: any) {
      if (e.response && e.response.status !== 404) {
        console.log(`[CANDIDATE] Core POST ${ep} : Status ${e.response.status}`, JSON.stringify(e.response.data));
      }
    }
  }
}

run();
