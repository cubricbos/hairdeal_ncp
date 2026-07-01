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
      payload: {
          shopName: "큐브릭헤어샵",
          shopNumber: "010-2117-0601",
          addressDetail: "717호",
          address: {
              sido: "서울", sigungu: "금천구", bname: "가산동", address: "서울 금천구 가산디지털1로 120", roadAddress: "서울 금천구 가산디지털1로 120", zonecode: "08590", latitude: 37.4761, longitude: 126.8837
          },
          businessTimes: [null, null, null, null, null, null, null],
          holidays: []
      },
      name: "basic"
    },
    {
      payload: {
          shopName: "큐브릭헤어샵",
          shopNumber: "010-2117-0601",
          addressDetail: "717호",
          address: {
              sido: "서울", sigungu: "금천구", bname: "가산동", address: "서울 금천구 가산디지털1로 120", roadAddress: "서울 금천구 가산디지털1로 120", zoneCode: "08590", latitude: 37.4761, longitude: 126.8837
          },
          businessTimes: [null, null, null, null, null, null, null],
          holidays: []
      },
      name: "zoneCode (camelCase)"
    },
    {
       payload: {
          shopName: "큐브릭헤어샵",
          shopNumber: "010-2117-0601",
          addressDetail: "717호",
          address: {
              sido: "서울", sigungu: "금천구", bname: "가산동", address: "서울 금천구 가산디지털1로 120", roadAddress: "서울 금천구 가산디지털1로 120", zonecode: "08590", location: { latitude: 37.4761, longitude: 126.8837 }
          },
          businessTimes: [null, null, null, null, null, null, null],
          holidays: []
      },
      name: "location object nested"
    },
    {
       payload: {
          hairShop: {
              name: "큐브릭헤어샵",
              number: "010-2117-0601",
              addressDetail: "717호",
              sido: "서울", sigungu: "금천구", bname: "가산동", address: "서울 금천구 가산디지털1로 120", roadAddress: "서울 금천구 가산디지털1로 120", zonecode: "08590", location: { latitude: 37.4761, longitude: 126.8837 }
          },
          businessTimes: [null, null, null, null, null, null, null],
          holidays: []
      },
      name: "hairShop object"
    }
  ];

  for (const t of testCases) {
    try {
      console.log(`\nTesting Case: ${t.name}`);
      const res = await client.post('/designer/management', t.payload);
      console.log(`SUCCESS ${t.name}: Status: ${res.status}`);
      console.log("Response:", JSON.stringify(res.data, null, 2));
    } catch (e: any) {
      console.log(`FAIL ${t.name}: status: ${e.response?.status}`);
      console.log("Body:", JSON.stringify(e.response?.data));
    }
  }
}

run();
