import axios from 'axios';
async function main() {
  try {
    const listRes = await axios.get('http://localhost:3000/api/core/admin/designers?size=50');
    const items = listRes.data.content || listRes.data.items || listRes.data;
    for (const item of items) {
      if (item.id) {
        const detRes = await axios.get(`http://localhost:3000/api/core/admin/designer?designerId=${item.id}`);
        const bt = detRes.data.businessTimes;
        if (bt && bt.some((b:any) => b !== null)) {
          console.log("Found bt for " + item.id + ":", JSON.stringify(bt, null, 2));
          break;
        }
      }
    }
  } catch(e:any) {}
}
main();
