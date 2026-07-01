import axios from 'axios';
import jwt from 'jsonwebtoken';

async function run() {
  const secret = '0cub6zbqmflr0ric1d';
  const c = axios.create({ baseURL: 'http://account.cubric.io/api' });

  console.log("--- Logging in as Admin ---");
  let listRes;
  try {
    const loginRes = await c.post('/admin/login', { accountId: 'admin', password: 'admin' });
    const token = loginRes.headers['x-cubric-authorization-token'] || loginRes.data?.token || loginRes.data?.accessToken;
    console.log("Admin login OK. Token:", !!token);
    c.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    listRes = await c.get('/admin/designers', { params: { size: 10 } });
    console.log("Found designers count:", listRes.data?.items?.length);
  } catch(e: any) {
    console.error("Admin login failed:", e.response?.status, e.response?.data);
    return;
  }

  const firstDesigner = listRes.data?.items?.[0];
  if (!firstDesigner) {
    console.log("No designers found.");
    return;
  }

  console.log("First Designer fetched details:", firstDesigner);

  // Generate a fully valid NCP designer JWT token using our official secret key, 
  // ensuring to package identical claims to AuthModal.tsx
  const designerPayload = {
    id: firstDesigner.id,
    name: firstDesigner.name || '디자이너',
    email: firstDesigner.email || 'designer@test.com',
    mobileNumber: firstDesigner.mobileNumber || '01033334444'
  };
  const dToken = jwt.sign(designerPayload, secret, { algorithm: 'HS256', expiresIn: '1d' });
  console.log("Designer Token created:", dToken);

  const client = axios.create({ 
    baseURL: 'http://account.cubric.io/api',
    headers: {
      'Authorization': `Bearer ${dToken}`,
      'x-cubric-designer-token': dToken
    }
  });

  console.log("--- Testing designer/detail ---");
  try {
    const dDetail = await client.get('/designer/detail');
    console.log("designer/detail response:", dDetail.data);
  } catch (e: any) {
    console.error("designer/detail failed:", e.response?.status, e.response?.data);
  }

  console.log("--- Testing POST /designer/change as JSON ---");
  try {
    const editJson = await client.post('/designer/change', {
      nickname: "수정테스트",
      nickName: "수정테스트",
      name: "수정테스트"
    });
    console.log("JSON Edit status:", editJson.status, editJson.data);
  } catch(e: any) {
    console.error("JSON Edit failed:", e.response?.status, e.response?.data);
  }

  console.log("--- Testing POST /designer/change as FormData ---");
  const fd = new FormData();
  fd.append("nickname", "수정테스트FD");
  fd.append("nickName", "수정테스트FD");
  fd.append("name", "수정테스트FD");
  try {
    const editFd = await client.post('/designer/change', fd);
    console.log("FormData Edit status:", editFd.status, editFd.data);
  } catch(e: any) {
    console.error("FormData Edit failed:", e.response?.status, e.response?.data);
  }

}
run();
