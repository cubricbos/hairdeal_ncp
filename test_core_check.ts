import axios from 'axios';
async function test() {
  try {
    const r = await axios.get(`http://localhost:3000/api/core/designer/check?mobileNumber=01012345678`);
    console.log('/designer/check:', r.status);
  } catch(e: any) {
    console.log('/designer/check fail:', e.response?.status, e.response?.data);
  }
}
test();
