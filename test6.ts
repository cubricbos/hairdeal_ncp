import axios from 'axios';
async function test() {
  try {
    const res = await axios.get(`http://localhost:3000/api/core/admin/designer?designerId=277a6532968840169d89501b7bfa1dbd`);
    console.log(JSON.stringify(res.data, null, 2));
  } catch(e:any) { console.log(e.response?.status); }
}
test();
