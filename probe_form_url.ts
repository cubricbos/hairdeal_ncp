import axios from 'axios';
import qs from 'qs';

async function probe() {
  const url = 'http://account.cubric.io/api/designer';
  
  const p = {
    email: `formurl${Date.now()}@example.com`,
    password: 'Password123!',
    passwordConfirm: 'Password123!',
    name: 'Form URL Test',
    mobileNumber: '01044445555',
    role: '디자이너'
  };

  try {
    console.log('Testing with application/x-www-form-urlencoded:', qs.stringify(p));
    const res = await axios.post(url, qs.stringify(p), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    console.log('SUCCESS:', res.status);
  } catch (err: any) {
    console.log('FAIL:', err.response?.status, JSON.stringify(err.response?.data));
  }
}

probe();
