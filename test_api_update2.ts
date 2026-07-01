import axios from 'axios';

async function run() {
  const c = axios.create({ baseURL: 'http://account.cubric.io/api' });
  try {
    const signup = await c.post('/designer', {
      mobileNumber: "01033334444",
      password: "Password123!",
      name: "Tester",
      nickname: "Tester",
      email: "test@test.com",
      role: "원장"
    });
    console.log("Signup:", signup.status);
  } catch (e:any) {
    console.log("Signup fail", e.response?.status, e.response?.data);
  }
  
  try {
    const dLogin = await c.post('/designer/login', {
      mobileNumber: "01033334444",
      password: "Password123!"
    });
    const dToken = dLogin.headers['x-cubric-designer-token'];

    c.defaults.headers.common['x-cubric-designer-token'] = dToken;
    console.log("Token ok");

    try {
      const fd = new FormData();
      fd.append("nickname", "Test2");
      const p = await c.post('/designer/change', fd, { headers: {"Content-Type": "multipart/form-data"}});
      console.log("FD change Success", p.status);
    } catch(e:any) {
      console.log("FD change fail", e.response?.status, e.response?.data);
    }
  } catch(e:any) {
    console.error("top level", e.message, e.response?.data);
  }
}
run();
