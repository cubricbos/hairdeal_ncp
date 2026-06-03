import axios from 'axios';
async function test() {
   try {
      const res = await axios.get('http://localhost:3000/api/account/v3/api-docs');
      console.log('Got it!', Object.keys(res.data.paths).filter(p => !p.includes('admin')));
   } catch(e) { console.log('not found'); }
}
test();
