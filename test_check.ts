import axios from 'axios';

async function test() {
  const accountBase = 'http://localhost:3000/api/account/designer';
  const tests = [
    { method: 'get', url: `${accountBase}/check-phone?mobileNumber=01012345678` },
    { method: 'get', url: `${accountBase}/check?mobileNumber=01012345678` },
    { method: 'post', url: `${accountBase}/check`, data: { mobileNumber: '01012345678' } },
  ];

  for (const t of tests) {
    try {
      const res = await (axios as any)[t.method](t.url, t.data);
      console.log(`[OK] ${t.method} ${t.url} - Status:`, res.status, res.data);
    } catch(e: any) {
      console.log(`[FAIL] ${t.method} ${t.url} - Status:`, e.response?.status, e.response?.data);
    }
  }
}
test();
