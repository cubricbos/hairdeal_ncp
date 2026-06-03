import axios from 'axios';
async function test() {
   try {
      const res = await axios.get('http://localhost:3000/api/core/admin/designers');
      console.log('SUCCESS FETCHING DESIGNERS:', res.status, JSON.stringify(res.data, null, 2));
   } catch(e: any) {
      console.log('Error fetching designers:', e.message, e.response?.status, e.response?.data);
   }
}
test();
