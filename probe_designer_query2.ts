import axios from 'axios';
async function run() {
  try {
    const res = await axios.get('http://localhost:3000/api/core/admin/designers');
    console.log("OK keys", Object.keys(res.data));
  } catch(e:any) {
    console.log("FAIL", e.response?.status, e.message);
  }
}
run();
