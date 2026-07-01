import jwt from 'jsonwebtoken';
import axios from 'axios';

async function run() {
  const secret = process.env.VITE_NCP_JWT_DESIGNER_SECRET_KEY || process.env.NCP_JWT_SECRET || '0cub6zbqmflr0ric1d';
  
  // Let's create an admin token to scan for raw designers list on NCP
  const adminPayload = { adminId: 'admin', adminPw: 'admin' };
  // Wait, we got 400 from admin/login previously. Maybe we don't need login, we can fetch all designers without login? No, but let's try.
  // Actually, we can fetch designers list directly if we can, or let's find other way.
  // What if we try with the original UUID id '5d7c9b60-7f05-482a-96d3-2f03be2dd6fe'?
  const testId = '5d7c9b60-7f05-482a-96d3-2f03be2dd6fe';
  const payloadHyphen = {
    id: testId,
    name: '아름 원장',
    email: 'tyhanareum@gmail.com'
  };
  const tokenHyphen = jwt.sign(payloadHyphen, secret, { algorithm: 'HS256', expiresIn: '1d' });
  console.log("Token with hyphen id:", tokenHyphen);

  const client = axios.create({ 
    baseURL: 'http://account.cubric.io/api',
    headers: {
      'x-cubric-designer-token': tokenHyphen,
      'Authorization': `Bearer ${tokenHyphen}`
    }
  });

  try {
    const detail = await client.get('/designer/detail');
    console.log("Hyphen id designer/detail OK:", detail.data);
    
    // If OK, let's test /designer/change
    console.log("--- Testing designer/change raw JSON ---");
    try {
      const editJson = await client.post('/designer/change', {
        nickname: "아름 원장 수정본",
        nickName: "아름 원장 수정본"
      });
      console.log("JSON edit OK:", editJson.status);
    } catch(e: any) {
      console.log("JSON edit Fail:", e.response?.status, e.response?.data);
    }

    console.log("--- Testing designer/change FormData ---");
    const fd = new FormData();
    fd.append("nickname", "아름 원장 수정본");
    try {
      const editFd = await client.post('/designer/change', fd);
      console.log("FormData edit OK:", editFd.status);
    } catch (e: any) {
      console.log("FormData edit Fail:", e.response?.status, e.response?.data);
    }

  } catch (e: any) {
    console.log("Hyphen id designer/detail Error:", e.response?.status, e.response?.data);
  }
}
run();
