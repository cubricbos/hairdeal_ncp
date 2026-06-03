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
      // ignore
    }
  }

  const paths = ['account/login', 'designer/login'];
  const keys1 = ['mobileNumber', 'phoneNumber', 'phone', 'contact'];
  const keys2 = ['verifyNumber', 'verifyCode', 'verificationCode', 'code', 'authCode'];

  for (const p of paths) {
    for (const k1 of keys1) {
      for (const k2 of keys2) {
        await tryLogin(p, k1, k2);
      }
    }
  }
  console.log('DONE');
}
probe();
