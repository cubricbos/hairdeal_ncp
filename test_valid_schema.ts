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
      'Content-Type': 'application/json'
    }
  });

  const payload = {
    shopName: "아이데 관악점",
    shopNumber: "027550022",
    addressDetail: "상세주소",
    address: {
      sido: "서울특별시",
      sigungu: "금천구",
      bname: "가산동",
      address: "서울 금천구 가마산로 72",
      roadAddress: "서울 금천구 가마산로 72",
      zoneCode: "08500", // Notice zoneCode with capital C
      latitude: 37.5,
      longitude: 127.0
    },
    businessTimes: [
      { weekday: 0, startedAt: "10:00:00", endedAt: "20:00:00" },
      { weekday: 1, startedAt: "10:00:00", endedAt: "20:00:00" },
      { weekday: 2, startedAt: "10:00:00", endedAt: "20:00:00" },
      { weekday: 3, startedAt: "10:00:00", endedAt: "20:00:00" },
      { weekday: 4, startedAt: "10:00:00", endedAt: "20:00:00" },
      { weekday: 5, startedAt: "10:00:00", endedAt: "20:00:00" },
      { weekday: 6, startedAt: "10:00:00", endedAt: "20:00:00" }
    ],
    holidays: []
  };

  try {
    const res = await client.post('/designer/management', payload);
    console.log(`PAYLOAD A SUCCESS!`, res.status, JSON.stringify(res.data).substring(0, 50));
  } catch(e: any) {
    console.log(`PAYLOAD A FAIL: ${e.response?.status} - ${JSON.stringify(e.response?.data)}`);
  }

  // Also try lowercase zonecode
  const payloadB = JSON.parse(JSON.stringify(payload));
  delete payloadB.address.zoneCode;
  payloadB.address.zonecode = "08500";

  try {
    const res = await client.post('/designer/management', payloadB);
    console.log(`PAYLOAD B SUCCESS!`, res.status, JSON.stringify(res.data).substring(0, 50));
  } catch(e: any) {
    console.log(`PAYLOAD B FAIL: ${e.response?.status} - ${JSON.stringify(e.response?.data)}`);
  }
}
run();
