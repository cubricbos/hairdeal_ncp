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
    zoneCode: "08590",
    location: {
      latitude: 37.4761900248913,
      longitude: 126.883723690494
    },
    businessNumber: "106-88-03341"
  };

  const payload = {
    shopName: "큐브릭헤어샵",
    shopNumber: "01021170601",
    addressDetail: "717호",
    address: baseAddress,
    businessTimes: [
      null,
      {
        startedAt: "2025-10-13T08:00:00Z",
        endedAt: "2025-10-13T23:00:00Z"
      },
      {
        startedAt: "2025-10-13T08:00:00Z",
        endedAt: "2025-10-13T23:00:00Z"
      },
      {
        startedAt: "2025-10-13T08:00:00Z",
        endedAt: "2025-10-13T23:00:00Z"
      },
      {
        startedAt: "2025-10-13T08:00:00Z",
        endedAt: "2025-10-13T23:00:00Z"
      },
      {
        startedAt: "2025-10-13T08:00:00Z",
        endedAt: "2025-10-13T23:00:00Z"
      },
      {
        startedAt: "2025-10-13T08:00:00Z",
        endedAt: "2025-10-13T23:00:00Z"
      }
    ],
    holidays: []
  };

  const testUrls = [
    `/designer/management?designerId=${realId}`,
    `/designer/management?id=${realId}`,
    `/designer/management`
  ];

  for (const url of testUrls) {
    try {
      console.log(`Testing POST to ${url}...`);
      const res = await client.post(url, payload);
      console.log(`SUCCESS! Status: ${res.status}`);
      console.log("Response data:", JSON.stringify(res.data, null, 2));
      return;
    } catch (e: any) {
      console.log(`FAIL status: ${e.response?.status}`);
      console.log("Error response body:", JSON.stringify(e.response?.data, null, 2));
    }
  }
}

run();
