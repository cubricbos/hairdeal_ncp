import axios from 'axios';
async function test() {
  try {
    for (let page = 0; page < 5; page++) {
      const res = await axios.get(`http://localhost:3000/api/core/admin/designers?page=${page}&size=100`);
      const items = res.data.items || res.data.content || res.data;
      if (!items || !items.length) break;
      const myUser = items.find((d: any) => d.mobileNumber === '01012345678' || d.phone === '01012345678' || d.name === '디자이너' || d.name === '마케팅맨');
      if (myUser) {
        console.log("My user ID:", myUser.id);
        const res2 = await axios.get(`http://localhost:3000/api/core/admin/designer?designerId=${myUser.id}`);
        console.log("My User Detail:", JSON.stringify(res2.data, null, 2));
        return;
      }
    }
    console.log("My user not found.");
  } catch(e:any) { console.log(e.response?.status); }
}
test();
