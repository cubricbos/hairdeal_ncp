import axios from 'axios';

async function run() {
  const c = axios.create({ baseURL: 'http://localhost:3000/api/core' });
  let token = null;
  try {
     const res = await c.post('/auth/login', { loginId: "01021170601", password: "Password123!" });
     token = res.headers['x-cubric-authorization-token'] || res.headers['authorization'];
     console.log("Logged in");
  } catch(e:any) {
     console.log("core /login fail", JSON.stringify(e.response?.data));
  }
}
run();
