import axios from 'axios';
import jwt from 'jsonwebtoken';

async function run() {
  const realId = 'e328fcf2daa441c3a2a9ac206e0d9e0f'; // 이현우
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

  const businessTimesFiltered = [
    {
      weekday: 1,
      startedAt: "2025-10-13T10:00:00Z",
      endedAt: "2025-10-13T20:00:00Z"
    }
  ];

  const payload = {
    shopName: "큐브릭헤어샵테스트",
    shopNumber: "01021170601",
    addressDetail: "717호",
    address: baseAddress,
    businessTimes: businessTimesFiltered,
    holidays: []
  };

  try {
    console.log("Testing POST to /designer/management without nulls in businessTimes");
    const res = await client.post('/designer/management', payload);
    console.log(`SUCCESS! Status: ${res.status}`);
    console.log("Response data:", JSON.stringify(res.data, null, 2));
  } catch (e: any) {
    console.log(`FAIL: ${e.response?.status}`);
    console.log("Error response body:", JSON.stringify(e.response?.data, null, 2));
  }
}

run();
