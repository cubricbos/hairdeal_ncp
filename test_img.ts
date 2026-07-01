import axios from 'axios';
async function test() {
  const url1 = 'http://api.cubric.io/api/storage?fileName=0b7847e1-5ca1-48d2-a79e-96727489ebdb.jpg';
  const url2 = 'http://hairdeal.cubric.io/api/storage?fileName=0b7847e1-5ca1-48d2-a79e-96727489ebdb.jpg';
  try {
    const res = await axios.get(url1);
    console.log("Success api.cubric.io:", res.status);
  } catch(e:any) {
    console.log("Fail api:", e.message);
  }
  try {
    const res = await axios.get(url2);
    console.log("Success hairdeal:", res.status);
  } catch(e:any) {
    console.log("Fail hairdeal:", e.message);
  }
}
test();
