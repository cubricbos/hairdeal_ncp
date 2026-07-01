import axios from 'axios';
async function test() {
  try {
    const res = await axios.get(`http://localhost:3000/api/core/admin/designers?page=0&size=100`);
    const items = res.data.items || res.data.content || res.data;
    for (const d of items) {
       const res2 = await axios.get(`http://localhost:3000/api/core/admin/designer?designerId=${d.id}`);
       if (res2.data.introduce || res2.data.career || res2.data.introduction || res2.data.careerYears) {
          console.log(`Found! ID: ${d.id}, introduce: ${res2.data.introduce || res2.data.introduction}, career: ${res2.data.career || res2.data.careerYears}`);
          return;
       }
    }
    console.log("No designer has introduce or career.");
  } catch(e:any) { console.log(e.response?.status); }
}
test();
