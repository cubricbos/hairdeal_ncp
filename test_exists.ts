import axios from 'axios';
async function test() {
  const eps = [
    'http://localhost:3000/api/account/designer/exists?mobileNumber=01012345678',
    'http://localhost:3000/api/account/designer/exists?phone=01012345678',
    'http://localhost:3000/api/core/admin/designer/exists?mobileNumber=01012345678',
    'http://localhost:3000/api/core/admin/designer/duplicate'
  ];
  for(const ep of eps) {
     try {
       const res = await axios.get(ep);
       console.log('Success:', ep, res.status);
     } catch(e: any) {
       console.log('Fail:', ep, e.response?.status);
     }
  }
}
test();
