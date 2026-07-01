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

  const baseAddress = {
    sido: "서울",
    sigungu: "금천구",
    bname: "가산동",
    address: "서울 금천구 가산디지털1로 120",
    roadAddress: "서울 금천구 가산디지털1로 120",
    zonecode: "08590",
    latitude: 37.4761,
    longitude: 126.8837
  };

  const variations = [
    {
      name: "T1: Basic flat fields with businessTimes and holidays null",
      data: {
        shopName: "큐브릭헤어샵",
        shopNumber: "01021170601",
        addressDetail: "717호",
        address: baseAddress,
        businessTimes: null,
        holidays: null
      }
    },
    {
      name: "T2: Basic flat fields with businessTimes and holidays omitted",
      data: {
        shopName: "큐브릭헤어샵",
        shopNumber: "01021170601",
        addressDetail: "717호",
        address: baseAddress
      }
    },
    {
      name: "T3: Basic flat fields with zoneCode (camelCase) and times null",
      data: {
        shopName: "큐브릭헤어샵",
        shopNumber: "01021170601",
        addressDetail: "717호",
        address: { ...baseAddress, zoneCode: "08590", zonecode: undefined },
        businessTimes: null,
        holidays: null
      }
    },
    {
      name: "T4: Basic flat fields with location nested, times null",
      data: {
        shopName: "큐브릭헤어샵",
        shopNumber: "01021170601",
        addressDetail: "717호",
        address: { 
          sido: "서울", sigungu: "금천구", bname: "가산동", 
          address: "서울 금천구 가산디지털1로 120", roadAddress: "서울 금천구 가산디지털1로 120", 
          zoneCode: "08590",
          location: { latitude: 37.4761, longitude: 126.8837 }
        },
        businessTimes: null,
        holidays: null
      }
    },
    {
      name: "T5: V4 layout (flat fields under hairShop wrapper), times null",
      data: {
        hairShop: {
          name: "큐브릭헤어샵",
          number: "01021170601",
          sido: "서울", sigungu: "금천구", bname: "가산동", 
          address: "서울 금천구 가산디지털1로 120", roadAddress: "서울 금천구 가산디지털1로 120", 
          addressDetail: "717호",
          zoneCode: "08590",
          location: { latitude: 37.4761, longitude: 126.8837 }
        },
        businessTimes: null,
        holidays: null
      }
    }
  ];

  for (const v of variations) {
    try {
      console.log(`\nTesting: ${v.name}`);
      const res = await client.post('/designer/management', v.data);
      console.log("SUCCESS!", res.status, JSON.stringify(res.data));
      break;
    } catch (e: any) {
      console.log("FAIL status:", e.response?.status);
      console.log("Error body:", JSON.stringify(e.response?.data));
    }
  }
}

run();
