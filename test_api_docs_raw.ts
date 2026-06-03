import axios from 'axios';
async function run() {
  const accountUrl = 'http://account.cubric.io/v3/api-docs';
  const coreUrl = 'http://hairdeal.cubric.io/v3/api-docs';
  
  try {
    const acc = await axios.get(accountUrl);
    console.log('ACCOUNT paths:', Object.keys(acc.data.paths));
  } catch(e: any) { 
    console.log('acc direct failed:', e.message); 
    if (e.response) {
       console.log('acc response status:', e.response.status, e.response.data);
    }
  }

  try {
    const core = await axios.get(coreUrl);
    console.log('CORE paths:', Object.keys(core.data.paths));
  } catch(e: any) { 
    console.log('core direct failed:', e.message); 
  }
}
run();
