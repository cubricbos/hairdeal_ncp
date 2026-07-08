import axios from 'axios';
import jwt from 'jsonwebtoken';

async function run() {
  const targetId = '277a6532968840169d89501b7bfa1dbd';
  const secret = '0cub6zbqmflr0ric1d';
  
  const token = jwt.sign({ id: targetId }, secret, { algorithm: 'HS256' });
  try {
    const res = await axios.get('http://hairdeal.cubric.io/api/faceswap/credit/history', {
      headers: { Authorization: `Bearer ${token}` },
      params: { month: 12, filter: 'ALL', pageNo: 1, pageSize: 50, designerId: targetId }
    });
    console.log("Success! Status:", res.status);
    console.log("Data:", JSON.stringify(res.data).substring(0, 200));
  } catch (e: any) {
    console.log("Fail:", e.response?.status, e.response?.data);
  }
}
run();
