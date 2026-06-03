import https from 'https';

import axios from 'axios';

async function test() {
  try {
    const res = await axios.get('http://account.cubric.io/api/account/designer/all');
    console.log("Success ->", res.status, res.headers['content-type']);
    if (res.data) {
       console.log(Array.isArray(res.data) ? res.data.length : Object.keys(res.data));
    }
  } catch (err: any) {
    console.log("Error ->", err.response ? err.response.status : err.message, err.config?.url);
  }
}
test();

