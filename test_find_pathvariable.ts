import axios from 'axios';

async function run() {
  const accountBase = 'http://localhost:3000/api/account/designer';

  const paths = [
    '/find/profile/01099999999',
    '/find/profile/01012345678',
    '/find/profile/hre21@naver.com',
    '/find/01099999999',
    '/profile/01099999999',
    '/01099999999'
  ];

  for(const p of paths) {
    try {
      const res = await axios.get(accountBase + p);
      console.log(`[SUCCESS] GET ${p} : status ${res.status}`, JSON.stringify(res.data));
    } catch(e: any) {
      if (e.response && e.response.status !== 404) {
        console.log(`[STATUS ${e.response.status}] GET ${p}`, JSON.stringify(e.response.data));
      } else {
        console.log(`[404] GET ${p}`);
      }
    }
  }
}
run();
