import axios from 'axios';
async function test() {
  const p = { email: 'test@abc.com', password: 'abc' };
  const urls = [
    'http://localhost:3000/api/account/login',
    'http://localhost:3000/api/auth/login',
    'http://localhost:3000/api/core/auth/login',
    'http://localhost:3000/api/core/auth/signin',
    'http://localhost:3000/api/account/auth/login',
    'http://localhost:3000/api/account/designer/sign-in',
    'http://localhost:3000/api/account/sign-in',
    'http://localhost:3000/api/v3/auth/login'
  ];
  for(const target of urls) {
     try {
        const res = await axios.post(target, p);
        console.log("OK", target, res.status);
     } catch(e:any) {
        console.log("FAIL", target, e.response?.status);
     }
  }
}
test();
