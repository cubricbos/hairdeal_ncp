import axios from 'axios';
async function test() {
  const accountBase = 'http://localhost:3000/api/account/designer';
  const urls = [
    '/check-duplicate', '/duplicate', '/validate-phone', '/check/mobile', '/mobile', '/validate'
  ];
  for(const url of urls) {
    try {
      const res = await axios.post(accountBase + url, { mobileNumber: '01012345678' });
      console.log(`POST ${url} :`, res.status);
    } catch(e: any) {
      console.log(`POST ${url} fail:`, e.response?.status);
    }
  }
}
test();
