import axios from 'axios';

async function test() {
  try {
    const res = await axios.post('http://127.0.0.1:3000/api/account/login/mobile', {
      mobileNumber: '01012345678',
      verifyNumber: '111111'
    });
    console.log("Success mobile user:", res.status);
  } catch (err: any) {
    console.log("Error mobile user:", err.response ? err.response.status : err.message, err.response?.data);
  }

  try {
    const res = await axios.post('http://127.0.0.1:3000/api/account/designer/login', {
      mobileNumber: '01012345678',
      verifyNumber: '111111'
    });
    console.log("Success mobile user 2:", res.status);
  } catch (err: any) {
    console.log("Error mobile user 2:", err.response ? err.response.status : err.message, err.response?.data);
  }
}
test();
