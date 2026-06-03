import axios from 'axios';
async function run() {
  try {
    const res = await axios.get('http://hairdeal.cubric.io/api/admin/designer/d779c8606e454c6dbb811f17293db655');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (e: any) {
    console.log('Error:', e?.response?.status);
  }
}
run();
