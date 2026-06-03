import axios from 'axios';
async function run() {
  try {
    const res = await axios.get('http://localhost:3000/api/core/admin/designers');
    const items = res.data?.items || res.data?.content || res.data || [];
    console.log('Designers length:', items.length);
    if (items.length > 0) {
      console.log('All items:', items.map((i: any) => ({id: i.id, mobile: i.mobileNumber, email: i.email})));
    }
  } catch(e: any) {
    console.log('Error:', e.message, e.response?.data);
  }
}
run();
