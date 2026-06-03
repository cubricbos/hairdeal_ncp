import axios from 'axios';

async function checkDetail() {
  const designerId = '213289c6bcb34908b7ad50ac6cc44048'; // 지선
  try {
    const res = await axios.get(`http://hairdeal.cubric.io/api/admin/designer`, {
      params: { designerId }
    });
    console.log('Detail for 지선:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error(err);
  }
}

checkDetail();
