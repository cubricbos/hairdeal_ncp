import axios from 'axios';
async function main() {
  try {
    const id = 'd2c289a28d76425894adaec4d9e9820a'; 
    const r = await axios.post(`http://hairdeal.cubric.io/api/faceswap/credit/admin/add?designerUid=${id}&amount=10`);
    console.log("Success DATA:", JSON.stringify(r.data, null, 2));
  } catch(e:any) {
    console.log("Fail:", e.response?.status, e.response?.data);
  }
}
main();
