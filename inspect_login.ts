import axios from 'axios';
async function test() {
  try {
    await axios.post(`http://localhost:3000/api/account/designer/login`, {
      mobileNumber: '01088889999',
      password: 'wrongpassword'
    });
  } catch(e: any) {
    console.log('Login error response data:', JSON.stringify(e.response?.data, null, 2));
  }
}
test();
