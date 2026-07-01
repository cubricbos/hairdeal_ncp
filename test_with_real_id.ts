import axios from 'axios';
import jwt from 'jsonwebtoken';

async function testWithRealId() {
  const realId = '277a6532968840169d89501b7bfa1dbd'; // 정훈
  const key = '0cub6zbqmflr0ric1d';
  
  const token = jwt.sign({ id: realId }, key, { algorithm: 'HS256' });

  const coreClient = axios.create({
    baseURL: 'http://hairdeal.cubric.io/api',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const accountPayload = {
      name: "정훈테스트샵",
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

  try {
      console.log("Trying Core /designer/hair-shop...");
      const res = await coreClient.post('/designer/hair-shop', accountPayload);
      console.log("SUCCESS Core /designer/hair-shop!", res.status, JSON.stringify(res.data));
  } catch (e: any) {
      console.log("FAIL Core /designer/hair-shop:", e.response?.status);
      console.log("Error details:", JSON.stringify(e.response?.data));
  }
}

testWithRealId();
