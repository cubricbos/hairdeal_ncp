import axios from 'axios';
async function test() {
  try {
    const r = await axios.post('http://localhost:3000/api/api/api/sms/verify/01012345678');
    const id = r.data.id;
    console.log('Sending verify to check properties...', id);
    try {
      const v = await axios.post('http://localhost:3000/api/api/api/sms/verify', {
         id: id,
         phoneNumber: '01012345678',
         verifyNumber: '111111'
      });
      console.log('Verify POST success', v.status);
    } catch(e: any) {
      console.log('Verify POST fail', e.response?.status, e.response?.data);
    }
    
    try {
      const v = await axios.put('http://localhost:3000/api/api/api/sms/verify', {
         id: id,
         phoneNumber: '01012345678',
         verifyNumber: '111111'
      });
      console.log('Verify PUT success', v.status);
    } catch(e: any) {
      console.log('Verify PUT fail', e.response?.status, e.response?.data);
    }

    try {
      const v = await axios.post(`http://localhost:3000/api/api/api/sms/verify/${id}`, {
         phoneNumber: '01012345678',
         verifyNumber: '111111'
      });
      console.log('Verify POST with ID success', v.status);
    } catch(e: any) {
      console.log('Verify POST with ID fail', e.response?.status, e.response?.data);
    }
  } catch(e: any) {
    console.log('Fail:', e.response?.status, e.response?.data);
  }
}
test();
