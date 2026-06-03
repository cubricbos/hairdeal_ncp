import axios from 'axios';

async function run() {
  const accountBase = 'http://localhost:3000/api/account/designer/find/profile';

  const paramsList = [
    { phone: '01012345678' },
    { email: 'hre21@naver.com' },
    { id: 'd779c8606e454c6dbb811f17293db655' },
    { designerId: 'd779c8606e454c6dbb811f17293db655' },
    { mobileNumber: '01099999999' },
    { phoneNumber: '01099999999' },
    { username: 'hre21@naver.com' }
  ];

  for(const params of paramsList) {
    try {
      const res = await axios.get(accountBase, { params });
      console.log(`[SUCCESS] with ${JSON.stringify(params)} : status ${res.status}`, JSON.stringify(res.data));
    } catch(e: any) {
      console.log(`[FAIL] with ${JSON.stringify(params)} : status ${e.response?.status}`, JSON.stringify(e.response?.data));
    }
  }
}
run();
