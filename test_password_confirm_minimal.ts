import axios from 'axios';
async function run() {
  const accountBase = 'http://localhost:3000/api/account/designer';

  const payload = {
    email: `pconf_min_${Date.now()}@example.com`,
    password: 'Password123!',
    passwordConfirm: 'Password123!',
    name: '최소인증',
    mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
    role: '디자이너'
  };

  try {
    console.log('Sending payload with passwordConfirm:');
    const res = await axios.post(accountBase, payload);
    console.log('SUCCESS REGISTERING:', res.status, res.data);
  } catch(e: any) {
    console.log('FAILED REGISTERING:', e.response?.status, JSON.stringify(e.response?.data, null, 2));
  }
}
run();
