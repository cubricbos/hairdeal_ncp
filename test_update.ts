import axios from 'axios';
async function test() {
  try {
    const r = await axios.get('http://hairdeal.cubric.io/api/faceswap/models');
    const firstModel = r.data.data[r.data.data.length - 1]; // pick a test one
    if (firstModel) {
      console.log("Found model:", firstModel.uid);
      const fd = new FormData();
      fd.append('gender', 'Male');
      fd.append('name', firstModel.name);
      fd.append('description', firstModel.description || "");
      const res = await axios.put(`http://hairdeal.cubric.io/api/faceswap/models/${firstModel.uid}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log("Updated", res.status);
    }
  } catch(e:any) {
    console.log("Error:", e.response?.status, e.response?.data || e.message);
  }
}
test();
