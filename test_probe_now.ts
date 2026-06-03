import axios from 'axios';
async function run() {
  try {
    const res = await axios.get('http://account.cubric.io/api/designer/all');
    console.log('get designer/all direct:', res.status, res.data?.length);
  } catch(e: any) { console.log('get designer/all direct err:', e?.response?.status) }

  try {
    const res = await axios.get('http://account.cubric.io/api/account/designer/all');
    console.log('get api/account/designer/all direct:', res.status, res.data?.length);
  } catch(e: any) { console.log('get api/account/designer/all direct err:', e?.response?.status) }

  try {
    const res = await axios.get('https://api.cubric.io/api/designer/all');
    console.log('get https api/designer/all:', res.status, res.data?.length);
  } catch(e: any) { console.log('get https api/designer/all err:', e?.response?.status) }

  try {
    const res = await axios.post('http://account.cubric.io/api/designer/login/mobile', { mobileNumber: '01012345678', verifyNumber: '111111' });
    console.log('post api/designer/mobile login:', res.status);
  } catch (e: any) { console.log('post api/designer/mobile login err:', e?.response?.status, e?.response?.data) }

  try {
    const res = await axios.post('http://account.cubric.io/api/account/login/mobile', { mobileNumber: '01012345678', verifyNumber: '111111' });
    console.log('post api/account/mobile login:', res.status);
  } catch (e: any) { console.log('post api/account/mobile login err:', e?.response?.status, e?.response?.data) }

  try {
    const res = await axios.post('http://account.cubric.io/designer/login/mobile', { mobileNumber: '01012345678', verifyNumber: '111111' });
    console.log('post designer/mobile login:', res.status);
  } catch (e: any) { console.log('post designer/mobile login err:', e?.response?.status, e?.response?.data) }

  try {
    const res = await axios.get('http://account.cubric.io/designer/all');
    console.log('get account.cubric.io/designer/all:', res.status, res.data?.length);
  } catch(e: any) { console.log('get account.cubric.io/designer/all err:', e?.response?.status) }
}
run();
