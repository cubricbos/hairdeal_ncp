import axios from 'axios';
async function main() {
  const id = 'd2c289a28d76425894adaec4d9e9820a'; 
  try {
    const r = await axios.get(`http://account.cubric.io/api/designer/find/profile?id=${id}`);
    console.log("find/profile?id=", Object.keys(r.data));
  } catch(e:any) { console.log("find/profile?id=", e.response?.status); }

  try {
    const r = await axios.get(`http://account.cubric.io/api/designer/find/profile?designerId=${id}`);
    console.log("find/profile?designerId=", Object.keys(r.data));
  } catch(e:any) { console.log("find/profile?designerId=", e.response?.status); }

  try {
    const r = await axios.get(`http://account.cubric.io/api/designer/find/profile/${id}`);
    console.log("find/profile/id", Object.keys(r.data));
  } catch(e:any) { console.log("find/profile/id", e.response?.status); }
}
main();
