import axios from 'axios';
import jwt from 'jsonwebtoken';

async function run() {
  const targetId = '4'; // Integer ID passed as string
  const secret = '0cub6zbqmflr0ric1d';
  
  const designerPayload = {
    id: targetId,
    name: '디자이너',
    email: 'designer@test.com',
    mobileNumber: '01033334444'
  };
  const token = jwt.sign(designerPayload, secret, { algorithm: 'HS256', expiresIn: '1d' });
  try {
    const res = await axios.get('http://hairdeal.cubric.io/api/faceswap/credit/history', {
      headers: { Authorization: `Bearer ${token}` },
      params: { month: 12, filter: 'ALL', pageNo: 1, pageSize: 50 }
    });
    console.log("Success! Status:", res.status);
    console.log("Data:", JSON.stringify(res.data).substring(0, 200));
  } catch (e: any) {
    console.log("Fail:", e.response?.status, JSON.stringify(e.response?.data));
  }
}
run();
