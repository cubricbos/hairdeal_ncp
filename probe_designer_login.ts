import axios from 'axios';

async function probe() {
  const url = 'http://account.cubric.io/api/designer';
  const dto = {
    email: `dto${Date.now()}@example.com`,
    password: 'password123',
    name: 'Designer Test',
    mobileNumber: `010${Math.floor(Math.random() * 89999999 + 10000000)}`,
  };

  try {
    const res = await axios.post(url, dto);
    console.log('DESIGNER CREATE SUCCESS:', res.status, res.headers['x-cubric-authorization-token']);
    
    // Attempt logins
    try {
        const loginRes = await axios.post('http://account.cubric.io/api/designer/login', {
            email: dto.email,
            password: dto.password
        });
        console.log('DESIGNER LOGIN SUCCESS:', loginRes.status);
    } catch(e: any) {
        console.log('DESIGNER LOGIN FAIL:', e.response?.status, e.response?.data);
    }
  } catch (err: any) {
    console.log('DESIGNER CREATE FAIL:', err.response?.status, err.response?.data);
  }
}
probe();
