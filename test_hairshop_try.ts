import axios from 'axios';
import jwt from 'jsonwebtoken';

async function run() {
  const realId = 'e328fcf2daa441c3a2a9ac206e0d9e0f'; 
  const key = '0cub6zbqmflr0ric1d';
  const token = jwt.sign({ id: realId }, key, { algorithm: 'HS256' });

  const client = axios.create({
    baseURL: 'http://account.cubric.io/api',
    headers: {
      Authorization: `Bearer ${token}`,
      'x-cubric-designer-token': token,
      'Content-Type': 'application/json'
    }
  });

  const baseTimes = Array.from({ length: 7 }, () => ({
    startedAt: "2026-06-12T10:00:00Z",
    endedAt: "2026-06-12T20:00:00Z"
  }));

  const payloads = [
    {
      hairShop: {
        name: "테스트매장1",
        number: "027550022",
        sido: "서울",
        sigungu: "금천구",
        bname: "가산동",
        address: "서울 금천구 가마산로 72",
        roadAddress: "서울 금천구 가마산로 72",
        addressDetail: "1123-433",
        zoneCode: "08500",
        location: { latitude: 37.4849670904198, longitude: 126.874544547722 }
      }
    },
    {
      name: "테스트매장2",
      number: "027550022",
      addressDetail: "1123-433",
      address: "서울 금천구",
      roadAddress: "서울 금천구",
      zipCode: "08500",
      latitude: 0,
      longitude: 0,
    },
    {
       name: "테스트매장3",
       number: "027550022",
       addressDetail: "1123-433",
       sido: "서울",
       sigungu: "금천구",
       bname: "가산동",
       address: "서울 금천구",
       roadAddress: "서울 금천구",
       zoneCode: "08500",
       location: { latitude: 37.5, longitude: 127.0 }
    }
  ];

  for (let i = 0; i < payloads.length; i++) {
    try {
      const res = await client.put('/hair-shop', payloads[i]);
      console.log(`PAYLOAD ${i} SUCCESS!`, res.status, res.data);
      break;
    } catch(e: any) {
      console.log(`PAYLOAD ${i} FAIL: ${e.response?.status} - ${JSON.stringify(e.response?.data)}`);
    }
  }
}
run();
