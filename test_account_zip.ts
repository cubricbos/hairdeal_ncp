import axios from 'axios';
import jwt from 'jsonwebtoken';

async function run() {
  const realId = '277a6532968840169d89501b7bfa1dbd'; // 정훈
  const key = '0cub6zbqmflr0ric1d';
  const token = jwt.sign({ id: realId }, key, { algorithm: 'HS256' });

  const client = axios.create({
    baseURL: 'http://account.cubric.io/api',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const testCases = [
    {
      name: "Z1: Standard payload using zipCode",
      data: {
        name: "큐브릭헤어샵",
        number: "01021170601",
        sido: "서울",
        sigungu: "금천구",
        bname: "가산동",
        address: "서울 금천구 가산디지털1로 120",
        roadAddress: "서울 금천구 가산디지털1로 120",
        addressDetail: "717호",
        zipCode: "08590",
        latitude: 37.4761,
        longitude: 126.8837,
        businessNumber: "106-88-03341"
      }
    },
    {
      name: "Z2: Minimum flat fields required by /hair-shop",
      data: {
        name: "큐브릭헤어샵",
        number: "01021170601",
        address: "서울 금천구 가산디지털1로 120",
        addressDetail: "717호",
        zipCode: "08590"
      }
    }
  ];

  for (const tc of testCases) {
    try {
      console.log(`\nTesting ${tc.name}...`);
      const res = await client.post('/hair-shop', tc.data);
      console.log(`SUCCESS! Status: ${res.status}`);
      console.log("Response data:", JSON.stringify(res.data, null, 2));
      return;
    } catch (e: any) {
      console.log(`FAIL: status: ${e.response?.status}`);
      console.log("Body:", JSON.stringify(e.response?.data));
    }
  }
}

run();
