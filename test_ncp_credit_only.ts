import axios from 'axios';
import jwt from 'jsonwebtoken';

async function run() {
  const accountId = '277a6532968840169d89501b7bfa1dbd';
  const secret = '0cub6zbqmflr0ric1d';
  const token = jwt.sign({ id: accountId }, secret, { algorithm: 'HS256', expiresIn: '1d' });
  try {
    const res = await axios.get('http://hairdeal.cubric.io/api/faceswap/credit', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Success! Status:", res.status);
    console.log("Data:", JSON.stringify(res.data).substring(0, 500));
  } catch (e: any) {
    console.log("Fail:", e.response?.status, JSON.stringify(e.response?.data));
  }
}
run();
