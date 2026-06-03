import axios from 'axios';
async function test() {
  try {
     const r = await axios.get('http://hairdeal.cubric.io/v3/api-docs');
     console.log('SUCCESS core swagger:', r.data.components?.schemas ? Object.keys(r.data.components.schemas).length : 'no schemas');
  } catch(e: any) {
     console.log('FAIL core swagger', e.message);
  }
}
test();
