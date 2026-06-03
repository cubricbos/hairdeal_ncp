import axios from 'axios';

async function test() {
  const token = "some_token";
  try {
    const res = await axios.get('http://127.0.0.1:3000/api/core/faceswap/credit/history');
    console.log("faceswap result:", res.status);
  } catch (err: any) {
    console.log("faceswap fail:", err.response?.status, err.response?.data);
  }

  try {
    const res2 = await axios.get('http://127.0.0.1:3000/api/core/credit/history');
    console.log("no faceswap result:", res2.status);
  } catch (err: any) {
    console.log("no faceswap fail:", err.response?.status, err.response?.data);
  }
}
test();
