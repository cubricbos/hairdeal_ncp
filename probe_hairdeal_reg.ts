import axios from 'axios';

async function probe() {
  const url = 'http://hairdeal.cubric.io/api/designer';
  
  const p = {
    email: `hairdeal${Date.now()}@example.com`,
    password: 'Password123!',
    passwordConfirm: 'Password123!',
    name: 'Hairdeal Core Test',
    mobileNumber: '01055554444',
    role: '디자이너'
  };

  try {
    console.log('Testing registration on CORE server (hairdeal.cubric.io):', url);
    const res = await axios.post(url, p);
    console.log('SUCCESS:', res.status);
  } catch (err: any) {
    console.log('FAIL:', err.response?.status, JSON.stringify(err.response?.data));
  }
}

probe();
