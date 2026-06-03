import axios from 'axios';
async function run() {
  const accountUrl = 'http://account.cubric.io:8080/v3/api-docs';
  const coreUrl = 'http://hairdeal.cubric.io:8080/v3/api-docs';
  
  try {
    const acc = await axios.get(accountUrl);
    console.log('ACCOUNT paths 8080:', Object.keys(acc.data.paths));
  } catch(e: any) { 
    console.log('acc 8080 failed:', e.message); 
  }

  try {
    const core = await axios.get(coreUrl);
    console.log('CORE paths 8080:', Object.keys(core.data.paths));
  } catch(e: any) { 
    console.log('core 8080 failed:', e.message); 
  }
}
run();
