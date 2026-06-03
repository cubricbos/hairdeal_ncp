import axios from 'axios';
async function run() {
  const accountUrl = 'http://localhost:3000/api/account/v3/api-docs';
  const coreUrl = 'http://localhost:3000/api/core/v3/api-docs';
  try {
     const acc = await axios.get(accountUrl);
     console.log('ACCOUNT paths:', Object.keys(acc.data.paths));
  } catch(e: any) { console.log('acc failed:', e.message); }

  try {
     const core = await axios.get(coreUrl);
     console.log('CORE paths:', Object.keys(core.data.paths));
  } catch(e: any) { console.log('core failed:', e.message); }
}
run();
