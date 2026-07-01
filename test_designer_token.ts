import jwt from 'jsonwebtoken';
import axios from 'axios';

async function run() {
  const secret = '0cub6zbqmflr0ric1d';
  
  // Create designer '지선' token precisely
  const payload = {
    id: '213289c6bcb34908b7ad50ac6cc44048',
    name: '지선',
    email: 'dev@cubric.io',
    mobileNumber: '01055225522'
  };

  const token = jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn: '1d' });
  console.log("Validated Designer token for '지선':", token);

  const client = axios.create({
    baseURL: 'http://account.cubric.io/api',
    headers: {
      'x-cubric-designer-token': token,
      'Authorization': `Bearer ${token}`
    }
  });

  console.log("--- Let's query /designer/detail ---");
  try {
    const detail = await client.get('/designer/detail');
    console.log("Detail Success:", detail.data);

    console.log("--- Test /designer/change with JSON ---");
    try {
      const resJson = await client.post('/designer/change', {
        name: '지선수정',
        nickName: '지선수정',
        nickname: '지선수정'
      });
      console.log("JSON response:", resJson.status, resJson.data);
    } catch(e: any) {
      console.log("JSON failed with:", e.response?.status, e.response?.data);
    }

    console.log("--- Test /designer/change with FormData ---");
    const fd = new FormData();
    fd.append('name', '지선수정FD');
    fd.append('nickname', '지선수정FD');
    fd.append('nickName', '지선수정FD');
    try {
      // Axios in NodeJS doesn't hold standard web FormData unless manually handled via form-data pkg or headers boundary
      const fdHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };
      // Since it's nodenv let's also test x-www-form-urlencoded string
      const urlParams = new URLSearchParams();
      urlParams.append('name', '지선수정URL');
      urlParams.append('nickname', '지선수정URL');
      urlParams.append('nickName', '지선수정URL');
      const resUrl = await client.post('/designer/change', urlParams, { headers: fdHeaders });
      console.log("URL Encoded response:", resUrl.status, resUrl.data);
    } catch (e: any) {
      console.log("URL Encoded failed with:", e.response?.status, e.response?.data);
    }

  } catch(e: any) {
    console.error("Detail Error:", e.response?.status, e.response?.data);
  }
}
run();
