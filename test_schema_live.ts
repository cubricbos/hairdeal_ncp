import axios from 'axios';
import jwt from 'jsonwebtoken';

async function run() {
  const realId = 'e328fcf2daa441c3a2a9ac206e0d9e0f'; // 이현우
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

  const detailRes = await client.get('/admin/designer', { params: { designerId: realId } });
  const designer = detailRes.data;
  console.log("RAW CORE DESIGNER DTO:", JSON.stringify(designer, null, 2));

  const originalTimes = designer.businessTimes || [];

  const payload = {
    shopName: "아이데 관악점 큐브릭",
    shopNumber: "027550022",
    addressDetail: "1123-433",
    address: {
      sido: "서울",
      sigungu: "금천구",
      bname: "가산동",
      address: "서울 금천구 가마산로 72",
      roadAddress: "서울 금천구 가마산로 72",
      zoneCode: "08500",
      location: {
        latitude: 37.4849670904198,
        longitude: 126.874544547722
      }
    },
    businessTimes: originalTimes.length === 7 ? originalTimes : Array.from({ length: 7 }, () => ({
      startedAt: "2026-06-12T10:00:00Z",
      endedAt: "2026-06-12T20:00:00Z"
    })),
    holidays: designer.holidays || []
  };
  console.log("CONSTRUCTED PAYLOAD (Format A - Flat shopName/shopNumber + 7 times):", JSON.stringify(payload, null, 2));

  const methods = ['POST', 'PUT'];
  const endpoints = ['/designer/management', '/designer', '/admin/designer'];

  for (const m of methods) {
    for (const ep of endpoints) {
      try {
        console.log(`\nTesting ${m} to ${ep}...`);
        const res = await (client as any)[m.toLowerCase()](ep, payload);
        console.log(`SUCCESS! Status: ${res.status}`);
        return;
      } catch (e: any) {
        console.log(`FAIL: ${e.response?.status} (${JSON.stringify(e.response?.data)})`);
      }
    }
  }
}

run();
