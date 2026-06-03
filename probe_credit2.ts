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
  await tryUrl('http://hairdeal.cubric.io/api/credit');
  await tryUrl('http://hairdeal.cubric.io/api/faceswap/credit');
  await tryUrl('http://account.cubric.io/api/credit');
  await tryUrl('http://account.cubric.io/api/designer/credit');
  await tryUrl('http://account.cubric.io/api/designer/me');
}
run();
