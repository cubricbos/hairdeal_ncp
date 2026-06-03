import axios from 'axios';

async function run() {
  const directURL = 'http://account.cubric.io/api/designer/login';

  try {
    console.log('Testing direct remote login to http://account.cubric.io/api/designer/login...');
    const res = await axios.post(directURL, {
      email: 'dltpwlswkdf@gmail.com',
      password: 'wrongpassword'
    });
    console.log(' -> SUCCESS:', res.status, res.data);
  } catch(e: any) {
    console.log(' -> FAIL STATUS:', e.response?.status);
    console.log('Error data:', JSON.stringify(e.response?.data));
  }
}

run();
