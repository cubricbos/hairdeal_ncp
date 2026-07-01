import axios from 'axios';

async function main() {
  try {
    const r = await axios.get('http://hairdeal.cubric.io/api/faceswap/models');
    console.log(JSON.stringify(r.data, null, 2));
  } catch(e:any) {
    console.log(e.response?.status, e.response?.data);
  }
}
main();
