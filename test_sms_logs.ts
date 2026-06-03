import axios from 'axios';
async function test() {
  try {
     const r = await axios.post('http://localhost:3000/api/api/api/sms/verify/01012345678');
     const logId = r.data.log.id;
     console.log('LOG ID', logId);
     const eps = [
        `http://localhost:3000/api/api/api/sms/log/${logId}`,
        `http://localhost:3000/api/api/api/sms/logs/${logId}`,
        `http://localhost:3000/api/api/api/sms/verify/log/${logId}`
     ];
     for (const ep of eps) {
        try {
           const res = await axios.get(ep);
           console.log('GET LOG', ep, 'Success', res.data);
        } catch(e: any) {
           console.log('GET LOG Fail', ep, e.response?.status);
        }
     }
  } catch(e) {}
}
test();
