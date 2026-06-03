import axios from 'axios';

async function probe() {
  try {
    const res = await axios.post('https://api.cubric.io/api/sms/send', {
      target: '01011112222'
    });
    console.log('SEND SUCCESS:', res.data);
    const id = res.data.id;
    // mock verify because we don't know the code, but let's just observe failure
    const verifyRes = await axios.post('https://api.cubric.io/api/sms/verify', {
      id: id,
      target: '01011112222',
      code: '000000'
    });
    console.log('VERIFY SUCCESS:', verifyRes.data);
  } catch (err: any) {
    console.log('FAIL:', err.response?.status, err.response?.data);
  }
}
probe();
