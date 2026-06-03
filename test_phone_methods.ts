import axios from 'axios';
async function test() {
  try {
     const methods = ['put', 'patch', 'post'];
     const url = 'http://localhost:3000/api/api/api/sms/verify/01012345678';
     
     for (const m of methods) {
        try {
           const res = await (axios as any)[m](url, { code: '111111' });
           console.log('M=', m, 'Success', res.status, res.data);
        } catch(e: any) {
           console.log('M=', m, 'Fail', e.response?.status, typeof e.response?.data === 'object' ? JSON.stringify(e.response?.data) : '');
        }
     }
  } catch(e) {}
}
test();
