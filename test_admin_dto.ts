import axios from 'axios';

async function main() {
  try {
    const res = await axios.get('http://localhost:3000/api/core/admin/designers');
    const items = res.data.items || res.data.content || res.data.data || res.data;
    console.log("DesignerListView keys:", Object.keys(items[0]));
    console.log("Designer 0:", JSON.stringify(items[0], null, 2));

    const resDetail = await axios.get(`http://localhost:3000/api/core/admin/designer?designerId=${items[0].id}`);
    console.log("UnConfirmedDesignerDto keys:", Object.keys(resDetail.data));
    console.log("Detail JSON:", JSON.stringify(resDetail.data, null, 2));
  } catch(e:any) {
    console.log("Fail", e.response?.status, e.response?.data);
  }
}
main();
