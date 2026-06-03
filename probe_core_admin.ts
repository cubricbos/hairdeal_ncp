import axios from 'axios';
async function run() {
  try {
    const res = await axios.get('http://hairdeal.cubric.io/api/admin/designers', {
      params: { size: 2 }
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (e: any) {
    console.log('Error:', e?.response?.status);
  }
}
run();
