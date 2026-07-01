import axios from 'axios';
async function test() {
  try {
    const r = await axios.get('http://hairdeal.cubric.io/api/faceswap/models');
    const firstModel = r.data.data[r.data.data.length - 1]; // pick a test one
    if (firstModel) {
      console.log("Deleting model:", firstModel.uid);
      const res = await axios.delete(`http://hairdeal.cubric.io/api/faceswap/models/${firstModel.uid}`);
      console.log("Deleted", res.status);
    }
  } catch(e:any) {
    console.log("Error:", e.response?.status, e.response?.data || e.message);
  }
}
test();
