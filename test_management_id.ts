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

  const rawFetch = await client.get('/admin/designer', { params: { designerId: realId } });
  const designer = rawFetch.data;
  
  // Try sending the hairShop object with ID
  let payload5 = {
      hairShopId: designer.hairShop.id,
      shopName: "아이데 관악점 업데이트",
      shopNumber: "027550022",
      addressDetail: "1123-433",
      address: {
        sido: "서울",
        sigungu: "금천구",
        bname: "가산동",
        address: "서울 금천구 가마산로 72",
        roadAddress: "서울 금천구 가마산로 72",
        zonecode: "08500", // maybe zoneCode or zonecode
        latitude: 37.484,
        longitude: 126.874
      },
      businessTimes: [null, null, null, null, null, null, null],
      holidays: []
  };

  try {
    const res = await client.post('/designer/management', payload5);
    console.log(`PAYLOAD 5 SUCCESS!`, res.status, JSON.stringify(res.data).substring(0, 50));
  } catch(e: any) {
    console.log(`PAYLOAD 5 FAIL: ${e.response?.status} - ${JSON.stringify(e.response?.data)}`);
  }
}
run();
