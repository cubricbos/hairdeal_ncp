import axios from 'axios';
async function testSearchByPhone() {
  const url = 'http://localhost:3000/api/core/v3/admin/designers?phone=01077589591';
  try {
    const res = await axios.get(url, { headers: { Authorization: `Bearer admin` } }); // Wait, maybe we don't need auth, or maybe we can't do this. 
    console.log(res.status);
  } catch (err: any) {
    console.log(err.message);
  }
}
testSearchByPhone();
