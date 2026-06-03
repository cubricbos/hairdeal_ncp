import axios from 'axios';
import fs from 'fs';
async function run() {
    try {
      const res = await axios.get('http://localhost:3000/api/core/v3/api-docs');
      fs.writeFileSync('core-swagger.json', JSON.stringify(res.data, null, 2));
      console.log('Saved core swagger.');
    } catch (e: any) { 
        console.log(e.message);
    }
}
run();
