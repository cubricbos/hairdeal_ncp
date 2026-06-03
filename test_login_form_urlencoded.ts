import axios from 'axios';

async function run() {
  const accountBase = 'http://localhost:3000/api/account/designer/login';

  const params = new URLSearchParams();
  params.append('email', 'dltpwlswkdf@gmail.com');
  params.append('password', 'wrongpassword');

  try {
    console.log('Testing urlencoded login...');
    const res = await axios.post(accountBase, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    console.log(' -> urlencoded success:', res.status, res.data);
  } catch(e: any) {
    console.log(' -> urlencoded fail:', e.response?.status, JSON.stringify(e.response?.data));
  }

  try {
    console.log('Testing json login...');
    const res = await axios.post(accountBase, {
      email: 'dltpwlswkdf@gmail.com',
      password: 'wrongpassword'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log(' -> json success:', res.status, res.data);
  } catch(e: any) {
    console.log(' -> json fail:', e.response?.status, JSON.stringify(e.response?.data));
  }
}

run();
