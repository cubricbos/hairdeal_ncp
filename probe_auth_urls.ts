import axios from 'axios';

async function probe() {
  const tryLogin = async (url, dto) => {
     try {
       const res = await axios.post(url, dto);
       console.log(`LOGIN SUCCESS ${url}:`, res.status, res.data);
     } catch (err: any) {
       console.log(`LOGIN FAIL ${url}:`, err.response?.status, err.response?.data);
     }
  }

  const dto = { mobileNumber: '01011112222', verifyNumber: '123456' };
  await tryLogin('http://account.cubric.io/api/auth/login', dto);
  await tryLogin('http://account.cubric.io/api/auth', dto);
  await tryLogin('http://account.cubric.io/auth/login', dto);
  await tryLogin('http://hairdeal.cubric.io/api/auth/login', dto);
  await tryLogin('http://hairdeal.cubric.io/api/designer/login', dto);
  await tryLogin('http://hairdeal.cubric.io/api/account/login', dto);
}

probe();
