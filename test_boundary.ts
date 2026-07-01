import axios from 'axios';

async function run() {
  const adminClient = axios.create({ baseURL: 'http://account.cubric.io/api' });
  const loginRes = await adminClient.post('/admin/login', { adminId: 'admin', adminPw: 'admin' });
  const token = loginRes.headers['x-cubric-authorization-token'];
  adminClient.defaults.headers.common['x-cubric-authorization-token'] = token;

  const listRes = await adminClient.get('/admin/designers', { params: { size: 10 } });
  
  const dLogin = await adminClient.post('/designer/login', {
    mobileNumber: listRes.data.items[0].mobileNumber,
    password: "Password123!"
  });
  const dToken = dLogin.headers['x-cubric-designer-token'];

  const c = axios.create({ baseURL: 'http://account.cubric.io/api' });
  c.defaults.headers.common['x-cubric-designer-token'] = dToken;

  const fd1 = new FormData();
  fd1.append("nickname", "Test2");

  try { await c.post('/designer/change', fd1, { headers: {"Content-Type": "multipart/form-data"} }); console.log("fd1 with header OK"); } catch(e:any) { console.log("fd1 with header Fail", e.response?.status, e.response?.data); }
  
  const fd2 = new FormData();
  fd2.append("nickname", "Test2");

  try { await c.post('/designer/change', fd2); console.log("fd2 without header OK"); } catch(e:any) { console.log("fd2 without header Fail", e.response?.status, e.response?.data); }
}
run();
