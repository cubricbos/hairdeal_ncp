import axios from 'axios';

async function test() {
  try {
    const res = await axios.get('http://backoffice.cubric.io/api/admin/designers', {
      params: { size: 10 }
    });
    console.log("Success:", res.data);
  } catch (err: any) {
    console.log("Error:", err.response ? err.response.status : err.message);
  }
}
test();
