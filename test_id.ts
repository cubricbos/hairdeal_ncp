import axios from 'axios';
async function test() {
  try {
    const id = '277a6532968840169d89501b7bfa1dbd';
    const res = await axios.get(`http://account.cubric.io/api/designer/detail?id=${id}`);
    console.log("Success:", JSON.stringify(res.data, null, 2));
  } catch(e:any) { console.log(e.response?.status, e.response?.data); }
}
test();
