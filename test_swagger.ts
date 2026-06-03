import axios from 'axios';
import fs from 'fs';
async function test() {
  try {
    const r = await axios.get('http://localhost:3000/api/api/v3/api-docs');
    fs.writeFileSync('swagger.json', JSON.stringify(r.data, null, 2));
    console.log('Saved swagger docs.');
  } catch(e: any) {
    console.log('Fail swagger docs', e.message);
  }
}
test();
