import axios from 'axios';

async function main() {
  try {
    const listRes = await axios.get('http://localhost:3000/api/core/admin/designers');
    const items = listRes.data.items || listRes.data.content || listRes.data;
    const id = items[0].id; // "d2c289a28d76425894adaec4d9e9820a"

    // try account server public endpoint
    const eps = [
      `http://localhost:3000/api/account/designer/find/profile?designerId=${id}`,
      `http://localhost:3000/api/account/designer/detail/${id}`,
      `http://localhost:3000/api/core/designer/profile?designerId=${id}`,
      `http://localhost:3000/api/core/designer?designerId=${id}`,
    ];

    for(let ep of eps) {
      try {
        const r = await axios.get(ep);
        console.log(`Success ${ep}:`, Object.keys(r.data));
      } catch(e:any) {
        console.log(`Fail ${ep}:`, e.response?.status);
      }
    }
  } catch(e) { console.log(e); }
}
main();
