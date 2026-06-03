import axios from 'axios';

async function probeOTP() {
  const url = 'http://account.cubric.io/api/sms';
  try {
     console.log('Testing GET /api/sms/01099998888');
     const res1 = await axios.get(`http://account.cubric.io/api/sms/01099998888`);
     console.log('GET 1:', res1.status, res1.data);
  } catch (e: any) { console.log('GET 1 FAIL:', e.response?.status); }
  
  try {
     console.log('Testing POST /api/sms/send');
     const res2 = await axios.post(`http://account.cubric.io/api/sms/send`, { mobileNumber: '01099998888' });
     console.log('POST 1:', res2.status, res2.data);
  } catch (e: any) { console.log('POST 1 FAIL:', e.response?.status); }

  try {
     console.log('Testing POST /api/account/sms');
     const res3 = await axios.post(`http://account.cubric.io/api/account/sms`, { mobileNumber: '01099998888' });
     console.log('POST 2:', res3.status, res3.data);
  } catch (e: any) { console.log('POST 2 FAIL:', e.response?.status); }

  try {
     console.log('Testing GET /api/account/sms/01099998888');
     const res4 = await axios.get(`http://account.cubric.io/api/account/sms/01099998888`);
     console.log('GET 2:', res4.status, res4.data);
  } catch (e: any) { console.log('GET 2 FAIL:', e.response?.status); }

}

probeOTP();
