import axios from 'axios';
import jwt from 'jsonwebtoken';

async function run() {
  const targetId = 4;
  const secret = '0cub6zbqmflr0ric1d';
  
  const token = jwt.sign({ id: targetId }, secret, { algorithm: 'HS256' });
  
  // Try minimal parameters
  try {
    const res = await axios.get('http://hairdeal.cubric.io/api/faceswap/credit/history', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Success! Status:", res.status);
    console.log("Data:", JSON.stringify(res.data).substring(0, 200));
  } catch (e: any) {
    console.log("Fail no params:", e.response?.status, JSON.stringify(e.response?.data));
  }
}
run();
