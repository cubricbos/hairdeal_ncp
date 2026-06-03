import axios from 'axios';
async function test() {
  try {
    const res = await axios.get('http://localhost:3000/api/core/admin/designers');
    const items = res.data?.items || res.data;
    items.forEach((d: any) => {
        console.log(d.id, d.mobileNumber, d.phone, d.contact, d.phoneNumber, d.name);
    });
  } catch(e) {}
}
test();
