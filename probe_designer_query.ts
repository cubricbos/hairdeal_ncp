import axios from 'axios';
async function run() {
  try {
    const res = await axios.get('http://localhost:3000/api/core/admin/designers', {
      params: { 
         phoneNumber: '010',
         mobileNumber: '010',
         phone: '010',
         keyword: '010',
         search: '010'
      }
    });
    console.log("OK", res.data?.content?.length);
  } catch(e:any) {
    console.log("FAIL", e.response?.status);
  }
}
run();
