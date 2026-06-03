import axios from 'axios';

async function testJoin() {
  const accountBase = 'http://localhost:3000/api/account';
  const coreBase = 'http://localhost:3000/api/core';
  
  const testData = {
    email: 'test_probe_' + Date.now() + '@example.com',
    password: 'password123!',
    passwordConfirm: 'password123!',
    name: '프로브테스터',
    mobileNumber: '010-1234-5678',
    phoneNumber: '010-1234-5678',
    phone: '010-1234-5678',
  };

  const accountEps = [
    '/designer',
    '/designers',
    '/designer/new',
    '/designer/add',
    '/designer/all',
    '/designer/save',
    '/admin/designer',
    '/admin/designers',
  ];

  const coreEps = [
    '/designer',
    '/designers',
    '/designer/join',
    '/designer/signup',
    '/designer/register',
    '/admin/designer',
    '/admin/designers',
    '/admin/designer/add',
    '/admin/designer/create',
  ];

  for (const ep of accountEps) {
    try {
      console.log(`Probing account ep: ${ep}...`);
      const res = await axios.post(`${accountBase}${ep}`, testData, { timeout: 3000 });
      console.log(`Success ${ep}:`, res.status, res.data);
    } catch (e: any) {
      console.log(`Fail ${ep} status:`, e.response?.status, `data:`, e.response?.data);
    }
  }

  for (const ep of coreEps) {
    try {
      console.log(`Probing core ep: ${ep}...`);
      const res = await axios.post(`${coreBase}${ep}`, testData, { timeout: 3000 });
      console.log(`Success ${ep}:`, res.status, res.data);
    } catch (e: any) {
      console.log(`Fail ${ep} status:`, e.response?.status, `data:`, e.response?.data);
    }
  }
}

testJoin();
