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
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
    }
  });

  const baseValidPayload = {
    // start bare minimum expected fields
  };

  const fieldsToTest = [
    { hairShop: { name: "test", number: "02", addressDetail: "test", address: "test", roadAddress: "test", zipCode: "test", latitude: 37, longitude: 127 } },
    { shopName: "test", shopNumber: "02" },
    { name: "test", number: "02" },
    { address: { sido: "test", sigungu: "test", bname: "test", address: "test", roadAddress: "test", zoneCode: "08500" } },
    { businessTimes: [] },
    { holidays: [] }
  ];

  console.log("Empty payload:");
  try {
    await client.post('/designer/management', {});
    console.log("Empty payload succeeded!?");
  } catch(e:any) {
    console.log("Empty payload 400 as expected");
  }

  for (let i = 0; i < fieldsToTest.length; i++) {
    const p = { ...fieldsToTest[i] };
    try {
      const res = await client.post('/designer/management', p);
      console.log(`SUCCESS with ${JSON.stringify(Object.keys(p))}`);
    } catch(e:any) {
      console.log(`FAIL with ${JSON.stringify(Object.keys(p))} : ${e.response?.data?.message || e.response?.data?.error || e.message}`);
    }
  }

}
run();
