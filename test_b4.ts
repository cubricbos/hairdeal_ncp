import axios from 'axios';
async function run() {
  try {
    const res = await axios.get('http://localhost:3000/api/core/admin/designer', {
      params: { designerId: 'b446a97e-a999-41bd-87a1-7f985a8fc77c' }
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch(e:any) { console.log(e.response?.status); }
}
run();
