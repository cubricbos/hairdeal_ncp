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
    shopName: "아아데 관악점",
    shopNumber: "027550022",
    addressDetail: "1123-433",
    sido: "서울",
    sigungu: "금천구",
    bname: "가산동",
    address: "서울 금천구 가마산로 72",
    roadAddress: "서울 금천구 가마산로 72",
    zoneCode: "08500",
    latitude: 37.5,
    longitude: 127,
    businessTimes: [
      null,
      {
        startedAt: "10:00",
        endedAt: "20:00"
      },
      {
        startedAt: "10:00",
        endedAt: "20:00"
      },
      {
        startedAt: "10:00",
        endedAt: "20:00"
      },
      {
        startedAt: "10:00",
        endedAt: "20:00"
      },
      {
        startedAt: "10:00",
        endedAt: "20:00"
      },
      null
    ],
    holidays: []
  };

  try {
    const res = await client.post('/designer/management', payload);
    console.log(`PAYLOAD SUCCESS!`, res.status, JSON.stringify(res.data).substring(0, 50));
  } catch(e: any) {
    console.log(`PAYLOAD FAIL: ${e.response?.status} - ${JSON.stringify(e.response?.data)}`);
  }
}
run();
