import axios from 'axios';
import jwt from 'jsonwebtoken';

async function run() {
  const c = axios.create({ baseURL: 'http://account.cubric.io/api' });

  const realId = 'e328fcf2daa441c3a2a9ac206e0d9e0f'; // 이현우
  const key = '0cub6zbqmflr0ric1d';
  const dToken = jwt.sign({ id: realId }, key, { algorithm: 'HS256' });

  c.defaults.headers.common['Authorization'] = `Bearer ${dToken}`;
  c.defaults.headers.common['x-cubric-designer-token'] = dToken;
  c.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1';

  console.log("Testing POST /designer/change with JSON payloads...");

  const detailsRes = await c.get('/designer/detail');
  const details = detailsRes.data;
  console.log("Current details fetched.");

  const testPayloads = [
    {
      name: "C1: Change basic fields",
      data: {
        name: "이현우 테스트",
        email: "pln@cubric.io",
        role: "디자이너"
      }
    },
    {
      name: "C2: Change with hairShop nested",
      data: {
        name: "이현우",
        hairShop: {
          id: details.hairShop?.id,
          name: "아데 관악점 테스트"
        }
      }
    },
    {
      name: "C3: Full clone update via change",
      data: {
        ...details,
        name: "이현우"
      }
    }
  ];

  for (const t of testPayloads) {
    try {
      console.log(`\nTesting: ${t.name}...`);
      const res = await c.post('/designer/change', t.data);
      console.log(`SUCCESS ${t.name}: Status ${res.status}`);
      console.log("Response:", JSON.stringify(res.data));
    } catch (e: any) {
      console.log(`FAIL ${t.name}: Status ${e.response?.status}`);
      console.log("Error response:", JSON.stringify(e.response?.data));
    }
  }
}

run();
