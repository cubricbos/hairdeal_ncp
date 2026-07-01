import axios from 'axios';
async function test() {
  try {
    const res = await axios.get('http://localhost:3000/api/core/admin/designers?size=500');
    const items = res.data.items || res.data;
    console.log("Total items:", items.length);
    // Find my user
    const myUser = items.find((d: any) => d.mobileNumber === '01012345678' || d.phone === '01012345678' || d.name === '마케팅맨' || d.name === '디자이너');
    if (myUser) {
      console.log("My user ID:", myUser.id);
      const res2 = await axios.get(`http://localhost:3000/api/core/admin/designer?designerId=${myUser.id}`);
      console.log("My User Detail:", JSON.stringify(res2.data, null, 2));
    } else {
      console.log("My user not found.");
    }
  } catch(e:any) { console.log(e); }
}
test();
