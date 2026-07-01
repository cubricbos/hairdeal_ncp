import axios from 'axios';
import jwt from 'jsonwebtoken';

async function run() {
  const realId = '277a6532968840169d89501b7bfa1dbd'; // 정훈
  const key = '0cub6zbqmflr0ric1d';
  const token = jwt.sign({ id: realId }, key, { algorithm: 'HS256' });

  const client = axios.create({
    baseURL: 'http://hairdeal.cubric.io/api',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  try {
      console.log("Testing POST to Core /designer/change");
      const res = await client.post('/designer/change', { nickname: '정훈테스트' });
      console.log(`SUCCESS Core /designer/change:`, res.status, res.data);
  } catch (e: any) {
      console.log(`FAIL Core /designer/change:`, e.response?.status, JSON.stringify(e.response?.data));
  }
}

run();
