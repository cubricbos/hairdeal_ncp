import axios from 'axios';

async function run() {
  const accountBase = 'http://localhost:3000/api/account/designer';

  // Generate a valid UUID with hyphens
  const uuidWithHyphens = 'c9e217aa-cbee-4b47-b7d8-b8af86677b9e'; // 36-char string

  const payload = {
    id: uuidWithHyphens,
    email: `test_uuid_${Date.now()}@example.com`,
    password: 'Password123!',
    name: '테스터대시',
    mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
    role: '디자이너',
    hairShop: {
      name: '대시매장',
      address: '인천 서구'
    }
  };

  try {
    console.log('Posting payload with UUID:', JSON.stringify(payload, null, 2));
    const res = await axios.post(accountBase, payload);
    console.log('SUCCESS with UUID:', res.status, res.data);
  } catch (e: any) {
    console.log('FAILED with UUID:', e.response?.status, JSON.stringify(e.response?.data, null, 2));
  }
}
run();
