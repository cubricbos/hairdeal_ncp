import axios from 'axios';
async function run() {
  const tryUrl = async (url) => {
    try {
      const res = await axios.post(url, { mobileNumber: '01012345678', verifyNumber: '111111' });
      console.log(`[Success] ${url} -> ${res.status}`);
    } catch(e: any) {
      console.log(`[Fail] ${url} -> ${e?.response?.status}`);
    }
  };
  await tryUrl('http://account.cubric.io/api/designer/login/mobile');
  await tryUrl('http://hairdeal.cubric.io/api/designer/login/mobile');

  await tryUrl('http://account.cubric.io/v1/auth/login');
  await tryUrl('http://hairdeal.cubric.io/v1/auth/login');

  await tryUrl('http://account.cubric.io/api/auth/login');
  await tryUrl('http://hairdeal.cubric.io/api/auth/login');

  await tryUrl('http://account.cubric.io/api/designer/login');
  await tryUrl('http://hairdeal.cubric.io/api/designer/login');
}
run();
