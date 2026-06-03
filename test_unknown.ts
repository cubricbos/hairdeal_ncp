import axios from 'axios';
async function test() {
  try {
     const res = await axios.post('http://localhost:3000/api/api/api/sms/verify/01012345678', {
       unknownPropertyThatDoesntExist: 'test'
     });
     console.log('Success, unknown properties are IGNORED!', res.status);
  } catch(e: any) {
     console.log('Fail unknown props:', e.response?.status);
  }
}
test();
