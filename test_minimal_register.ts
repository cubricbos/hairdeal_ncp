import axios from 'axios';

async function run() {
  const accountBase = 'http://localhost:3000/api/account/designer';

  const payloads = [
    {
      email: `min_${Date.now()}@example.com`,
      password: 'Password123!',
      name: '최소림',
      mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
      role: '디자이너'
    },
    {
      email: `min_role_${Date.now()}@example.com`,
      password: 'Password123!',
      name: '최소림두',
      mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
      role: 'DESIGNER'
    },
    {
      email: `min_no_role_${Date.now()}@example.com`,
      password: 'Password123!',
      name: '최소림삼',
      mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000)
    }
  ];

  for (const p of payloads) {
    try {
      console.log('Testing payload:', JSON.stringify(p, null, 2));
      const res = await axios.post(accountBase, p);
      console.log('SUCCESS:', res.status, res.data);
      return;
    } catch(e: any) {
      console.log('FAILED:', e.response?.status, JSON.stringify(e.response?.data, null, 2));
    }
  }
}
run();
