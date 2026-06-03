import axios from 'axios';

async function probe() {
  const tryLogin = async (path, key1, key2) => {
    try {
      const res = await axios.post(`http://account.cubric.io/api/${path}`, {
        [key1]: '01011112222',
        [key2]: '123456'
      });
      console.log(`SUCCESS ${path} ${key1}/${key2}`, res.status);
    } catch(e: any) {
      if (e.response?.status !== 400 && e.response?.status !== 404) {
          console.log(`FAIL ${path} ${key1}/${key2}`, e.response?.status);
      }
    }
  }
  
  const keys1 = ['mobileNumber', 'phoneNumber', 'number', 'phone'];
  const keys2 = ['verifyNumber', 'authNumber', 'authCode', 'verifyCode', 'code'];

  for (const k1 of keys1) {
    for (const k2 of keys2) {
      await tryLogin('account/login', k1, k2);
    }
  }
  console.log('DONE');
}
probe();
