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
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
      'Content-Type': 'application/json'
    }
  });

  try {
    const detailRes = await client.get('/designer/detail');
    const hairShop = detailRes.data.hairShop;
    console.log("Original hairShop structure:", JSON.stringify(hairShop, null, 2));

    if (!hairShop) {
      console.log("No hairShop in details.");
      return;
    }

    // Attempt 1: Exact clone with modified name (POST)
    const clonedShop = { ...hairShop };
    clonedShop.name = clonedShop.name + " TEST";

    console.log("\nAttempt 1: Sending exact clone (POST)...");
    try {
      const res1 = await client.post('/hair-shop', clonedShop);
      console.log("Attempt 1 (POST) SUCCESS! Status:", res1.status, res1.data);
      return;
    } catch (e1: any) {
      console.log("Attempt 1 (POST) FAIL:", e1.response?.status, JSON.stringify(e1.response?.data));
    }

    // Attempt 1-PUT: Exact clone with modified name (PUT)
    console.log("\nAttempt 1-PUT: Sending exact clone (PUT)...");
    try {
      const res1put = await client.put('/hair-shop', clonedShop);
      console.log("Attempt 1-PUT (PUT) SUCCESS! Status:", res1put.status, res1put.data);
      return;
    } catch (e1put: any) {
      console.log("Attempt 1-PUT (PUT) FAIL:", e1put.response?.status, JSON.stringify(e1put.response?.data));
    }

    // Attempt 2: Flattened loc (POST)
    const flatLocShop = { ...hairShop };
    flatLocShop.latitude = hairShop.location?.latitude || 37.5;
    flatLocShop.longitude = hairShop.location?.longitude || 127.0;
    delete flatLocShop.location;
    flatLocShop.name = flatLocShop.name + " TEST2";

    console.log("\nAttempt 2: Sending flattened location (POST)...");
    try {
      const res2 = await client.post('/hair-shop', flatLocShop);
      console.log("Attempt 2 (POST) SUCCESS! Status:", res2.status, res2.data);
      return;
    } catch (e2: any) {
      console.log("Attempt 2 (POST) FAIL:", e2.response?.status, JSON.stringify(e2.response?.data));
    }

    // Attempt 2-PUT: Flattened loc (PUT)
    console.log("\nAttempt 2-PUT: Sending flattened location (PUT)...");
    try {
      const res2put = await client.put('/hair-shop', flatLocShop);
      console.log("Attempt 2-PUT (PUT) SUCCESS! Status:", res2put.status, res2put.data);
      return;
    } catch (e2put: any) {
      console.log("Attempt 2-PUT (PUT) FAIL:", e2put.response?.status, JSON.stringify(e2put.response?.data));
    }

    // Attempt 3: Let's see if we should post to '/designer' with the hairShop nested
    console.log("\nAttempt 3: Sending nested hairShop to PUT /designer...");
    try {
      const rootPayload = {
        ...detailRes.data,
        hairShop: clonedShop
      };
      const res3 = await client.put('/designer', rootPayload);
      console.log("Attempt 3 SUCCESS! Status:", res3.status, res3.data);
      return;
    } catch (e3: any) {
      console.log("Attempt 3 FAIL:", e3.response?.status, JSON.stringify(e3.response?.data));
    }

  } catch (e: any) {
    console.error("Fetch failed:", e.message);
  }
}

run();
