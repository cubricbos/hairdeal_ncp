import axios from 'axios';
async function run() {
  const accountBase = 'http://localhost:3000/api/account';
  const urls = [
    '/join', '/register', '/signup', 
    '/auth/join', '/auth/signup', '/auth/register'
  ];
  for (const url of urls) {
    try {
      const res = await axios.post(`${accountBase}${url}`, {
        email: "test@ex.com", password: "Password123!"
      });
      console.log('SUCCESS:', url, res.status);
    } catch (e: any) {
      console.log('FAIL:', url, e.response?.status);
    }
  }
}
run();
