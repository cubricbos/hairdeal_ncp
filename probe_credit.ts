import axios from 'axios';
async function run() {
  const tryUrl = async (url) => {
    try {
      const res = await axios.get(url, { headers: { 'Authorization': 'Bearer test' }});
      console.log(`[Success] ${url} -> ${res.status}`);
    } catch(e: any) {
      console.log(`[Fail] ${url} -> ${e?.response?.status}`);
    }
  };
  await tryUrl('http://hairdeal.cubric.io/api/credit/history');
  await tryUrl('http://hairdeal.cubric.io/api/faceswap/credit/history');
  await tryUrl('http://hairdeal.cubric.io/api/account/credit/history');
  await tryUrl('http://account.cubric.io/api/credit/history');
  await tryUrl('http://account.cubric.io/api/faceswap/credit/history');
  await tryUrl('http://hairdeal.cubric.io/api/admin/credit/history');
}
run();
