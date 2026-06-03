import axios from 'axios';
async function run() {
  const url = 'http://account.cubric.io/api/designer/login';
  const bodies = [
    { email: 'test@example.com', password: 'abc' },
    { loginId: 'test@example.com', password: 'abc' },
    { username: 'test@example.com', password: 'abc' },
    { mobileNumber: '01012345678', password: 'abc' },
    { phone: '01012345678', password: 'abc' },
    { id: 'test', pw: 'abc' }
  ];

  for (const b of bodies) {
    try {
      const res = await axios.post(url, b);
      console.log(`[Success] payload ${Object.keys(b)} -> ${res.status}`);
    } catch(e: any) {
      console.log(`[Fail] payload ${Object.keys(b)} -> ${e?.response?.status} (${e?.response?.data?.error || e?.response?.data?.message || 'unknown'})`);
    }
  }
}
run();
