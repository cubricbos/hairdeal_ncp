import axios from 'axios';
import jwt from 'jsonwebtoken';

async function run() {
  const realId = 'e328fcf2daa441c3a2a9ac206e0d9e0f'; // 이현우
  const key = '0cub6zbqmflr0ric1d';
  const token = jwt.sign({ id: realId }, key, { algorithm: 'HS256' });

  const client = axios.create({
    baseURL: 'http://account.cubric.io/api',
    headers: {
      Authorization: `Bearer ${token}`,
      'x-cubric-designer-token': token,
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
    }
  });

  const detailRes = await client.get('/designer/detail');
  const details = detailRes.data;
  
  const payload = {
    ...details,
    name: "이현우",
  };

  const methods = ['POST', 'PUT'];
  const endpoints = [`/designer/${realId}`, `/designer/management/${realId}`, `/designer/change/${realId}`];
  
  for (const ep of endpoints) {
    for (const m of methods) {
      try {
        console.log(`\nTesting: ${m} ${ep}...`);
        const res = await client({ method: m, url: ep, data: payload });
        console.log(`SUCCESS ${m} ${ep}: Status ${res.status}`);
        console.log("Response:", JSON.stringify(res.data));
      } catch (e: any) {
        console.log(`FAIL ${m} ${ep}: Status ${e.response?.status}`);
      }
    }
  }
}

run();
