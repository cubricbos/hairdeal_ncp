import axios from 'axios';

async function test() {
  try {
    const res = await axios.post('http://127.0.0.1:3000/api/account/designer/login', {
      email: 'test@test.com',
      password: 'password123!'
    });
    console.log("Success login:", res.status);
  } catch (err: any) {
    console.log("Error login:", err.response ? err.response.status : err.message, err.response?.data);
  }

  try {
    const res2 = await axios.post('http://127.0.0.1:3000/api/account/user/login/mobile', {
      mobileNumber: '01012345678',
      verifyNumber: '111111'
    });
    console.log("Success mobile user:", res2.status);
  } catch (err: any) {
    console.log("Error mobile user:", err.response ? err.response.status : err.message, err.response?.data);
  }
}
test();
