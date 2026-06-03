import axios from 'axios';
async function test() {
  const hosts = [
    'http://account.cubric.io',
    'http://hairdeal.cubric.io',
    'https://api.cubric.io'
  ];
  for (const host of hosts) {
    try {
      const u = host + '/sms/verify/01012345678';
      const r = await axios.post(u, {});
      console.log('Success:', u, r.status);
    } catch(e: any) {
      console.log('Fail:', host + '/sms/verify/01...', e.response?.status, typeof e.response?.data === 'object' ? JSON.stringify(e.response?.data) : e.response?.data?.substring?.(0, 50));
    }
    try {
      const u2 = host + '/api/sms/verify/01012345678';
      const r2 = await axios.post(u2, {});
      console.log('Success:', u2, r2.status);
    } catch(e: any) {
      console.log('Fail:', host + '/api/sms/verify...', e.response?.status, typeof e.response?.data === 'object' ? JSON.stringify(e.response?.data) : e.response?.data?.substring?.(0, 50));
    }
  }
}
test();
