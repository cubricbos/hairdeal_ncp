import axios from 'axios';

async function run() {
  const adminClient = axios.create({ baseURL: 'http://account.cubric.io/api' });
  try {
    const loginRes = await adminClient.post('/admin/login', { adminId: 'admin', adminPw: 'admin' });
    const token = loginRes.headers['x-cubric-authorization-token'];
    adminClient.defaults.headers.common['x-cubric-authorization-token'] = token;

    const listRes = await adminClient.get('/admin/designers', { params: { size: 10 } });
    const dId = listRes.data.items[0].id;
    const detail = await adminClient.get('/admin/designer', { params: { designerId: dId } });
    
    const mobileNumber = detail.data.mobileNumber;
    const dLogin = await adminClient.post('/designer/login', {
      mobileNumber,
      password: "Password123!"
    });
    const dToken = dLogin.headers['x-cubric-designer-token'];

    const c = axios.create({ baseURL: 'http://account.cubric.io/api' });
    c.defaults.headers.common['x-cubric-designer-token'] = dToken;

    console.log("Token ok", mobileNumber);

    try {
      const fd = new FormData();
      fd.append("nickname", "Test");
      fd.append("name", "Testname");
      const p = await c.post('/designer/change', fd, { headers: {"Content-Type": "multipart/form-data"}});
      console.log("FD change Success", p.status);
    } catch(e:any) {
      console.log("FD change fail", e.response?.status, e.response?.data);
    }
    
    try {
      const p = await c.post('/designer', { nickname: "Test", name: "Testname" });
      console.log("POST /designer Success", p.status);
    } catch(e:any) {
      console.log("POST /designer fail", e.response?.status, e.response?.data);
    }
  } catch(e:any) {
    console.error("top level", e.message);
  }
}
run();
