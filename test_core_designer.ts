import axios from 'axios';
async function test() {
  try {
    const id = 'd2c289a28d76425894adaec4d9e9820a';
    const res = await axios.get(`http://localhost:3000/api/core/designer?designerId=${id}`);
    console.log("Core designer:", JSON.stringify(res.data, null, 2));
  } catch(e:any) { console.log(e.response?.status, e.response?.data); }

  try {
    const id = 'd2c289a28d76425894adaec4d9e9820a';
    const res = await axios.get(`http://localhost:3000/api/core/designer/${id}`);
    console.log("Core designer id:", JSON.stringify(res.data, null, 2));
  } catch(e:any) { console.log(e.response?.status, e.response?.data); }
}
test();
