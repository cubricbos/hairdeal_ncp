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

  const testCases = [
    {
      name: "C1: Only shopName and shopNumber",
      data: {
        shopName: "큐브릭헤어샵",
        shopNumber: "01021170601"
      }
    },
    {
      name: "C2: Including minimum address as string",
      data: {
        shopName: "큐브릭헤어샵",
        shopNumber: "01021170601",
        addressDetail: "717호",
        address: "서울 금천구 가산디지털1로 120"
      }
    },
    {
      name: "C3: Flat shopName, shopNumber, businessNumber",
      data: {
        shopName: "큐브릭헤어샵",
        shopNumber: "01021170601",
        businessNumber: "106-88-03341"
      }
    },
    {
      name: "C4: Outer hairShop object wrapper",
      data: {
        hairShop: {
          name: "큐브릭헤어샵",
          number: "01021170601"
        }
      }
    }
  ];

  for (const tc of testCases) {
    try {
      console.log(`\nTesting: ${tc.name}`);
      const res = await client.post('/designer/management', tc.data);
      console.log(`SUCCESS! Status: ${res.status}`);
      console.log("Response data:", JSON.stringify(res.data, null, 2));
      return;
    } catch (e: any) {
      console.log(`FAIL status: ${e.response?.status}`);
      console.log("Error details:", JSON.stringify(e.response?.data));
    }
  }
}

run();
