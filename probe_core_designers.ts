import axios from 'axios';
async function run() {
  const tryUrl = async (url) => {
    try {
      const res = await axios.get(url);
      console.log(`[Success] ${url} -> ${res.status} data keys: ${Object.keys(res.data)}`);
    } catch(e: any) {
      console.log(`[Fail] ${url} -> ${e?.response?.status}`);
    }
  };
  await tryUrl('http://hairdeal.cubric.io/api/designer/all');
  await tryUrl('http://hairdeal.cubric.io/api/designers');
  await tryUrl('http://hairdeal.cubric.io/api/admin/designers');
}
run();
