import axios from 'axios';

async function test() {
  try {
    const res = await axios.get('http://account.cubric.io/api/designers');
    console.log(JSON.stringify(res.data, null, 2));
  } catch(e: any) {
    console.log('failed /designers:', e.response?.status, e.response?.data);
  }
}
test();
