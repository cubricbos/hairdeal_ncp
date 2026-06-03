import axios from 'axios';
async function test() {
  try {
    const r = await axios.post('http://localhost:3000/api/api/api/sms/verify/01012345678', {}, {
      headers: {
        'Referer': 'https://ais-dev-okiiejc7q47cn2y2rwcqcq-94346158915.asia-northeast1.run.app/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
      }
    });
    console.log('r success');
  } catch(e: any) {
    console.log('r failed:', e.response?.status, typeof e.response?.data === 'object' ? JSON.stringify(e.response?.data) : e.response?.data?.substring(0, 50));
  }
}
test();
