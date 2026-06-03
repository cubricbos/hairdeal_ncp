import axios from 'axios';
async function test() {
  try {
    const res = await axios.get('http://localhost:3000/api/core/admin/designers', {
      params: { search: '01012345678', keyword: '01012345678', mobileNumber: '01012345678', q: '01012345678', query: '01012345678' }
    });
    console.log('Search 01012345678 success:', res.data?.items?.length || res.data?.length);
  } catch(e: any) {
    console.log('Search error:', e.response?.status, e.response?.data);
  }

  try {
    const res = await axios.get('http://localhost:3000/api/core/admin/designers');
    const items = res.data?.items || res.data;
    console.log('Total designers:', items?.length);
    const hasPhone = items.find((i: any) => JSON.stringify(i).includes('01012345678'));
    console.log('Has 01012345678 cached?', !!hasPhone);
  } catch(e) {}
}
test();
