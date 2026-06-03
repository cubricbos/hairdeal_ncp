import axios from 'axios';
async function test() {
  try {
      const v = await axios.get(`https://api.cubric.io/api/v3/api-docs`);
      const paths = Object.keys(v.data.paths).filter(p => p.includes('sms'));
      console.log('paths API.CUBRIC.IO:', paths);
      for (const p of paths) {
         console.log(p, JSON.stringify(v.data.paths[p], null, 2));
      }
  } catch(e) {
     console.log('first failed', e.message);
  }
  try {
      const v = await axios.get(`https://api.cubric.io/v3/api-docs`);
      const paths = Object.keys(v.data.paths).filter(p => p.includes('sms'));
      console.log('paths API.CUBRIC.IO 2:', paths);
      for (const p of paths) {
         console.log(p, JSON.stringify(v.data.paths[p], null, 2));
      }
  } catch(e) {
     console.log('second failed', e.message);
  }
}
test();
