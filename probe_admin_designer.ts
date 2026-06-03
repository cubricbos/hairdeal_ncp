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
  await tryUrl('http://account.cubric.io/api/admin/designers');
  await tryUrl('http://account.cubric.io/api/admin/designer');
  await tryUrl('http://account.cubric.io/api/designer/all');
  await tryUrl('http://hairdeal.cubric.io/api/admin/designers');
}
run();
