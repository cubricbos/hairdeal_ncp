import axios from 'axios';
async function run() {
  const accountUrl = 'http://account.cubric.io/api';
  const id = '277a6532968840169d89501b7bfa1dbd'; 
  const eps = [
    `/admin/designer/detail?designerId=${id}`,
    `/admin/designer/profile?designerId=${id}`
  ];
  for (const ep of eps) {
    try {
      const res = await axios.get(accountUrl + ep);
      console.log(ep, Object.keys(res.data));
    } catch(e:any) { console.log(ep, e.response?.status); }
  }
}
run();
