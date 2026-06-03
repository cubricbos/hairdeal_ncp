import axios from 'axios';

async function run() {
  const coreBase = 'http://localhost:3000/api/core';

  const testData = {
    id: 'c2c289a28d76425894adaec4d9e9821d',
    email: `adm_ds_${Date.now()}@example.com`,
    password: 'Password123!',
    name: '어드민테스터',
    mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
    role: '디자이너',
    hairShop: {
      name: '어드민테스트매장',
      address: '인천 서구'
    }
  };

  const eps = [
    '/admin/designer',
    '/admin/designers',
    '/admin/designer/create',
    '/admin/designer/add'
  ];

  for (const ep of eps) {
    try {
      console.log(`Testing CORE POST ${ep}`);
      const res = await axios.post(coreBase + ep, testData);
      console.log(` -> SUCCESS! Status ${res.status}`, JSON.stringify(res.data));
    } catch(e: any) {
      console.log(` -> FAIL: Status ${e.response?.status}`, JSON.stringify(e.response?.data));
    }
  }
}
run();
