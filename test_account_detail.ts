import axios from 'axios';
import jwt from 'jsonwebtoken';

async function run() {
  const realId = 'e328fcf2daa441c3a2a9ac206e0d9e0f'; // 이현우
  const key = '0cub6zbqmflr0ric1d';
  const token = jwt.sign({ id: realId }, key, { algorithm: 'HS256' });

  try {
    const res = await axios.get(`http://account.cubric.io/api/designer/detail`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-cubric-designer-token': token,
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
      }
    });
    console.log("Designer keys:", Object.keys(res.data));
    const fields = [
      'id', 'name', 'email', 'mobileNumber', 'signedBy', 'socialLoginId', 'provider', 'snsType', 'loginType'
    ];
    fields.forEach(f => {
      console.log(`${f}:`, res.data[f]);
    });
  } catch (e: any) {
    console.log("Error querying Account server:", e.message);
  }
}

run();

