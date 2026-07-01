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

  const detailRes = await client.get('/admin/designer', { params: { designerId: realId } });
  const d = detailRes.data;

  const payloads = [
    {
      shopName: "큐브릭헤어샵",
      shopNumber: "01021170601",
      addressDetail: "717호",
      address: {
        sido: "서울", sigungu: "금천구", bname: "가산동",
        address: "서울 금천구 가산디지털1로 120", roadAddress: "서울 금천구 가산디지털1로 120",
        zonecode: "08590",
        latitude: 37.4761, longitude: 126.8837
      },
      businessTimes: null,
      holidays: null,
      businessNumber: "106-88-03341"
    },
    {
      shopName: "큐브릭헤어샵",
      shopNumber: "01021170601",
      addressDetail: "717호",
      address: {
        sido: "서울", sigungu: "금천구", bname: "가산동",
        address: "서울 금천구 가산디지털1로 120", roadAddress: "서울 금천구 가산디지털1로 120",
        zonecode: "08590",
        latitude: 37.4761, longitude: 126.8837,
        businessNumber: "106-88-03341"
      },
      businessTimes: null,
      holidays: null
    }
  ];

  for (const p of payloads) {
    try {
      console.log(`\nTesting payload...`);
      const res = await client.post('/designer/management', p);
      console.log("SUCCESS!", res.status, JSON.stringify(res.data));
    } catch (e: any) {
      console.log("FAIL status:", e.response?.status);
      console.log("Error body:", JSON.stringify(e.response?.data));
    }
  }
}

run();
