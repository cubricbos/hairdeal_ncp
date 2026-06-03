import axios from 'axios';
async function run() {
  try {
    const res = await axios.get('http://localhost:3000/api/account/designer', { headers: { 'Authorization': 'Bearer test' } });
    console.log("account/designer GET ok", res.status);
  } catch(e:any) {
    console.log("account/designer GET fail", e.response?.status, e.response?.data);
  }
}
run();
