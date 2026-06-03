import axios from 'axios';

async function fuzzAdminLogin() {
  const url = 'http://account.cubric.io/api/admin/login';
  
  const bodies = [
    { username: 'admin', password: 'password' },
    { email: 'admin', password: 'password' },
    { accountId: 'admin', password: 'password' },
    { userId: 'admin', password: 'password' },
    { adminId: 'admin', password: 'password' },
    { loginId: 'admin', password: 'password' },
    { id: 'admin', password: 'password' },
    { mobileNumber: '01077589591', password: 'password' },
    { accountId: 'admin@cubric.io', password: 'password' },
    { admin: 'admin', password: 'password' }
  ];

  for (let i = 0; i < bodies.length; i++) {
    try {
      const res = await axios.post(url, bodies[i]);
      console.log(`SUCCESS [${i}] ${JSON.stringify(bodies[i])}:`, res.status, res.data);
    } catch (err: any) {
      console.log(`FAIL [${i}] ${JSON.stringify(bodies[i])}:`, err.response?.status, err.response?.data);
    }
  }
}

fuzzAdminLogin();
