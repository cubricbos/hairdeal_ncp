import axios from 'axios';
async function run() {
  const tryUrl = async (url) => {
    try {
      const res = await axios.get(url);
      console.log(`[Success] ${url} -> ${res.status}`);
    } catch(e: any) {
      console.log(`[Fail] ${url} -> ${e?.response?.status}`);
    }
  };
  await tryUrl('http://account.cubric.io/v1/designer/all');
  await tryUrl('http://account.cubric.io/api/v1/designer/all');
  await tryUrl('http://account.cubric.io/api/system/designer/all');
  await tryUrl('http://hairdeal.cubric.io/api/designer/all');
  await tryUrl('http://hairdeal.cubric.io/designer/all');
}
run();
