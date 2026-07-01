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

  try {
    const res = await client.get('/designer/management');
    console.log(`GET SUCCESS!`, res.status, JSON.stringify(res.data, null, 2));
  } catch(e: any) {
    console.log(`GET FAIL: ${e.response?.status} - ${JSON.stringify(e.response?.data)}`);
  }
}
run();
