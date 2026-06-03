import axios from 'axios';
async function test() {
  try{
    const res = await axios.get('http://localhost:3000/api/core/admin/designers/7994fd24-811c-4b55-a095-2acbebbc5df2');
    console.log(res.status, res.data.id);
  } catch(e:any) {
    console.log(e.response?.status, e.response?.data);
  }
}
test();
