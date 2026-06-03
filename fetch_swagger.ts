import axios from 'axios';

async function fetchSwagger() {
  try {
    const res = await axios.get('http://account.cubric.io/v3/api-docs');
    console.log(JSON.stringify(res.data).substring(0, 500));
    // Let's search for "login" in the swagger paths
    const paths = res.data.paths;
    const loginPaths = Object.keys(paths).filter(p => p.toLowerCase().includes('login') || p.toLowerCase().includes('sign-in') || p.toLowerCase().includes('account'));
    
    for (const p of loginPaths) {
      console.log('Path:', p);
      if (paths[p].post) {
        console.log('  POST body ref:', paths[p].post.requestBody?.content['application/json']?.schema?.$ref);
      }
    }
  } catch (err: any) {
    console.log('FAIL:', err.message);
  }
}

fetchSwagger();
