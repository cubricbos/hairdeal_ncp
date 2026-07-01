import axios from 'axios';
import fs from 'fs';
async function test() {
  try {
    const res = await axios.get('http://localhost:3000/api/account/v3/api-docs');
    fs.writeFileSync('swag.json', JSON.stringify(res.data, null, 2));
    console.log("Written to swag.json");
  } catch(e:any) { console.log(e.response?.status); }
}
test();
