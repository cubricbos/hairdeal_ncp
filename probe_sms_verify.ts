import axios from 'axios';
async function probe() {
  try {
      const loginRes = await axios.post('https://api.cubric.io/sms/verify', {
          id: 'test',
          target: '01011112222',
          code: '123456'
      });
      console.log('VERIFY SUCCESS:', loginRes.status, loginRes.data);
  } catch(e: any) {
      console.log('VERIFY FAIL:', e.response?.status, e.response?.data);
  }
}
probe();
