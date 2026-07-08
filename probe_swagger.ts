import axios from 'axios';
async function run() {
  try {
    const r = await axios.get('http://hairdeal.cubric.io/v3/api-docs');
    const paths = r.data.paths;
    const matches = Object.keys(paths).filter(p => p.toLowerCase().includes('credit') || p.toLowerCase().includes('history') || p.toLowerCase().includes('admin'));
    console.log("Found core paths:");
    for (let m of matches) console.log(m);
  } catch(e:any) { console.log("core swag fail"); }
  
  try {
    const r2 = await axios.get('http://account.cubric.io/v3/api-docs');
    const paths = r2.data.paths;
    const matches = Object.keys(paths).filter(p => p.toLowerCase().includes('credit') || p.toLowerCase().includes('history') || p.toLowerCase().includes('admin'));
    console.log("Found account paths:");
    for (let m of matches) console.log(m);
  } catch(e:any) { console.log("account swag fail"); }
}
run();
