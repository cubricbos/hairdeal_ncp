import { accountClient } from './src/lib/ncpClient.js';
import axios from 'axios';

async function test() {
  try {
    const res = await axios.post('http://localhost:3000/api/account/designer/login', {
      mobileNumber: '01012345678',
      password: 'dummyPassword123!'
    });
    console.log('01012345678 Success:', res.status, res.data);
  } catch(e: any) {
    console.log('01012345678 Failed:', e.response?.status, e.response?.data);
  }
}
test();
