import axios from 'axios';
import jwt from 'jsonwebtoken';

async function run() {
  const realId = 'e328fcf2daa441c3a2a9ac206e0d9e0f'; 
  const key = '0cub6zbqmflr0ric1d';
  const token = jwt.sign({ id: realId }, key, { algorithm: 'HS256' });

  const client = axios.create({
    baseURL: 'http://hairdeal.cubric.io/api',
    headers: {
      Authorization: `Bearer ${token}`,
      'x-cubric-designer-token': token,
      'Content-Type': 'application/json'
    }
  });

  const rawFetch = await client.get('/admin/designer', { params: { designerId: realId } });
  const designer = rawFetch.data;
  
  // Try sending the exact same designer data back, just updating the name
  let payload3 = {
      ...designer,
      hairShop: {
          ...designer.hairShop,
          name: "아이데 관악점",
          number: "027550022"
      }
  };

  try {
    const res = await client.post('/designer/management', payload3);
    console.log(`PAYLOAD 3 SUCCESS!`, res.status, JSON.stringify(res.data).substring(0, 50));
  } catch(e: any) {
    console.log(`PAYLOAD 3 FAIL: ${e.response?.status} - ${JSON.stringify(e.response?.data)}`);
  }

  // Try just sending hairShop exactly as it was + changes
  let payload4 = {
      hairShop: {
          ...designer.hairShop,
          name: "아이데 관악점"
      }
  };

  try {
    const res = await client.post('/designer/management', payload4);
    console.log(`PAYLOAD 4 SUCCESS!`, res.status, JSON.stringify(res.data).substring(0, 50));
  } catch(e: any) {
    console.log(`PAYLOAD 4 FAIL: ${e.response?.status} - ${JSON.stringify(e.response?.data)}`);
  }

}
run();
