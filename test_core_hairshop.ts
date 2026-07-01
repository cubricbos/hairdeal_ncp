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

  const shopPayload = {
      name: "정훈테스트숍",
      number: "01021170601",
      sido: "서울",
      sigungu: "금천구",
      bname: "가산동",
      address: "서울 금천구 가산디지털1로 120",
      roadAddress: "서울 금천구 가산디지털1로 120",
      addressDetail: "717호",
      zoneCode: "08590",
      latitude: 37.4761,
      longitude: 126.8837,
      businessNumber: "106-88-03341"
  };

  const endpoints = ['/hair-shop', '/designer/hair-shop', '/designer/shop', '/shop'];

  for (const ep of endpoints) {
    try {
      console.log(`Testing POST to Core ${ep}`);
      const res = await client.post(ep, shopPayload);
      console.log(`SUCCESS Core ${ep}:`, res.status, res.data);
      return;
    } catch (e: any) {
      console.log(`FAIL Core ${ep}:`, e.response?.status, JSON.stringify(e.response?.data));
    }
  }
}

run();
