import axios from 'axios';
import jwt from 'jsonwebtoken';

async function run() {
  const accountId = '277a6532968840169d89501b7bfa1dbd';
  const secret = '0cub6zbqmflr0ric1d';
  
  const designerPayload = {
    id: accountId, // This is the string UUID
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
