import axios from 'axios';
async function test() {
  try {
     await axios.post('http://localhost:3000/api/api/api/sms/verify/abcdef');
  } catch(e: any) {
     console.log('abcdef =>', e.response?.status, e.response?.data);
  }
}
test();
