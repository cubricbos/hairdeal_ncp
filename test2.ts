import axios from 'axios';

async function test() {
  try {
    const res = await axios.get('http://account.cubric.io/api/admin/designers');
    const items = res.data.content || res.data.items || res.data;
    if (items && items.length > 0) {
      console.log("Account Admin Designers (first 1):", JSON.stringify(items[0], null, 2));
      const res2 = await axios.get(`http://account.cubric.io/api/admin/designer/${items[0].id || items[0].designerId}`);
      console.log("Account Admin Designer Detail:", JSON.stringify(res2.data, null, 2));
    }
  } catch(e: any) {
    if (e.response && e.response.status === 404) {
      try {
        const id = 'd2c289a28d76425894adaec4d9e9820a';
        const res3 = await axios.get(`http://account.cubric.io/api/admin/designer/${id}`);
        console.log("fallback res3:", res3.data);
      } catch(e2:any) { console.log("fallback fail:", e2.response?.status) }
    }
    console.log('failed:', e.response?.status, e.response?.data);
  }
}
test();
