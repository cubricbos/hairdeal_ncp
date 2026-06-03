import axios from 'axios';
async function test() {
  try {
    const res = await axios.get('http://localhost:3000/api/core/admin/designer?designerId=d779c8606e454c6dbb811f17293db655');
    console.log('detail:', JSON.stringify(res.data, null, 2));
  } catch(e) {}
}
test();
