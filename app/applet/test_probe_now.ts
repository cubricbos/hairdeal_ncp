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
    console.log('post mobile login:', res.status);
  } catch (e: any) { console.log('post mobile login err:', e?.response?.status, e?.response?.data) }
}
run();
