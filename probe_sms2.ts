import axios from 'axios';
async function probe() {
  const tryUrl = async (url) => {
    try {
      const res = await axios.post(url, { target: '01011112222' });
      console.log('SUCCESS:', url, res.status);
    } catch(e: any) {
      console.log('FAIL:', url, e.response?.status);
    }
  };
  await tryUrl('https://api.cubric.io/api/sms/request');
  await tryUrl('http://account.cubric.io/api/sms/send');
  await tryUrl('http://hairdeal.cubric.io/api/sms/send');
  await tryUrl('http://hairdeal.cubric.io/sms/send');
}
probe();
