import axios from 'axios';
async function test() {
  try {
     const r = await axios.post('http://localhost:3000/api/api/api/sms/verify/01012345678');
     console.log('ID:', r.data.id);
     try {
       const v = await axios.put('http://localhost:3000/api/api/api/sms/verify/01012345678', {
           verifyNumber: '111111'
       });
       console.log('PUT success', v.status);
     } catch(e: any) {
       console.log('PUT fail', e.response?.status, e.response?.data);
     }
  } catch(e) {}
}
test();
