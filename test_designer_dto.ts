import axios from 'axios';
import jwt from 'jsonwebtoken';

async function run() {
  const realId = 'e328fcf2daa441c3a2a9ac206e0d9e0f'; // 이현우
  const key = '0cub6zbqmflr0ric1d';
  const token = jwt.sign({ id: realId }, key, { algorithm: 'HS256' });

  const client = axios.create({
    baseURL: 'http://hairdeal.cubric.io/api',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  // 1. Fetch exact original designer DTO
  const detailRes = await client.get('/admin/designer', { params: { designerId: realId } });
  const designer = detailRes.data;

  console.log("Original designer fetched.");

  // Test Case D1: Send full designer DTO as-is
  try {
    console.log("D1: Sending full designer DTO as is...");
    const res1 = await client.post('/designer/management', designer);
    console.log(`D1 SUCCESS! Status: ${res1.status}`);
    console.log("Response:", JSON.stringify(res1.data, null, 2));
    return;
  } catch (e: any) {
    console.log(`D1 FAIL: ${e.response?.status} / Body: ${JSON.stringify(e.response?.data)}`);
  }

  // Test Case D2: Wrap it inside a wrapper or modify fields
  try {
    const wrapped = {
      designer: designer
    };
    console.log("D2: Sending wrapped designer...");
    const res2 = await client.post('/designer/management', wrapped);
    console.log(`D2 SUCCESS! Status: ${res2.status}`);
    return;
  } catch (e: any) {
    console.log(`D2 FAIL: ${e.response?.status} / Body: ${JSON.stringify(e.response?.data)}`);
  }
}

run();
