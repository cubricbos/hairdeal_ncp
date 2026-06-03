import axios from 'axios';
async function test() {
  const eps = [
    '/api/account/auth/signup',
    '/api/account/auth/join',
    '/api/account/auth/register',
    '/api/core/auth/signup',
  ];
  for (const ep of eps) {
     try {
       console.log('Testing', ep);
       const res = await axios.post('http://localhost:3000' + ep, {
         email: 'test_probe_' + Date.now() + '@example.com',
         password: 'password123!',
         passwordConfirm: 'password123!',
         name: '프로브테스터',
         mobileNumber: '010-1234-5678',
       });
       console.log('Success', ep, res.status);
     } catch(e: any) {
       console.log('Fail', ep, e.response?.status, e.response?.data);
     }
  }
}
test();
