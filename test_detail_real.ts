import axios from 'axios';
import jwt from 'jsonwebtoken';

async function testDetailReal() {
  const realId = '277a6532968840169d89501b7bfa1dbd'; // 정훈
  const key = '0cub6zbqmflr0ric1d';
  const token = jwt.sign({ id: realId }, key, { algorithm: 'HS256' });

  const client = axios.create({
    baseURL: 'http://account.cubric.io/api',
    headers: {
      Authorization: `Bearer ${token}`,
      'x-cubric-designer-token': token
    }
  });

  try {
    const res = await client.get('/designer/detail');
    console.log("SUCCESS status:", res.status);
    console.log("Data structure:", JSON.stringify(res.data, null, 2));
  } catch (e: any) {
    console.log("FAILED status:", e.response?.status);
    console.log("Response body:", JSON.stringify(e.response?.data, null, 2));
  }
}

testDetailReal();
