import axios from 'axios';
import jwt from 'jsonwebtoken';

async function run() {
  const realId = '277a6532968840169d89501b7bfa1dbd'; // 정훈
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
  const d = detailRes.data;
  const currentShop = d.hairShop || {};

  const variations = [
    {
      name: "V1: Match existing structure exactly with location nested",
      data: {
        id: currentShop.id,
        name: "큐브릭헤어샵테스트",
        number: "01021170601",
        sido: "서울",
        sigungu: "금천구",
        bname: "가산동",
        address: "서울 금천구 가산디지털1로 120",
        roadAddress: "서울 금천구 가산디지털1로 120",
        addressDetail: "717호",
        zoneCode: "08590",
        location: {
          latitude: 37.47619,
          longitude: 126.88372
        },
        businessNumber: "106-88-03341"
      }
    },
    {
      name: "V2: Match existing structure exactly with flat latitude and longitude",
      data: {
        id: currentShop.id,
        name: "큐브릭헤어샵테스트",
        number: "01021170601",
        sido: "서울",
        sigungu: "금천구",
        bname: "가산동",
        address: "서울 금천구 가산디지털1로 120",
        roadAddress: "서울 금천구 가산디지털1로 120",
        addressDetail: "717호",
        zoneCode: "08590",
        latitude: 37.47619,
        longitude: 126.88372,
        businessNumber: "106-88-03341"
      }
    },
    {
      name: "V3: Match existing structure exactly with zonecode (lowercase)",
      data: {
        id: currentShop.id,
        name: "큐브릭헤어샵테스트",
        number: "01021170601",
        sido: "서울",
        sigungu: "금천구",
        bname: "가산동",
        address: "서울 금천구 가산디지털1로 120",
        roadAddress: "서울 금천구 가산디지털1로 120",
        addressDetail: "717호",
        zonecode: "08590",
        latitude: 37.47619,
        longitude: 126.88372,
        businessNumber: "106-88-03341"
      }
    },
    {
      name: "V4: Omit id",
      data: {
        name: "큐브릭헤어샵테스트",
        number: "01021170601",
        sido: "서울",
        sigungu: "금천구",
        bname: "가산동",
        address: "서울 금천구 가산디지털1로 120",
        roadAddress: "서울 금천구 가산디지털1로 120",
        addressDetail: "717호",
        zoneCode: "08590",
        location: {
          latitude: 37.47619,
          longitude: 126.88372
        },
        businessNumber: "106-88-03341"
      }
    }
  ];

  for (const v of variations) {
    try {
      console.log(`\nTesting ${v.name}...`);
      const res = await client.post('/hair-shop', v.data);
      console.log(`SUCCESS! Status: ${res.status}`);
      console.log("Response data:", JSON.stringify(res.data, null, 2));
      break;
    } catch (e: any) {
      console.log(`FAIL: ${e.response?.status}`);
      console.log("Error response body:", JSON.stringify(e.response?.data, null, 2));
    }
  }
}

run();
