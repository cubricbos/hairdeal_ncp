import axios from 'axios';

async function run() {
  const url = 'http://localhost:3000/api/account/designer/all';
  try {
    console.log('Fetching all designers from Account Server...');
    const res = await axios.get(url);
    console.log(' -> SUCCESS! Totals:', res.data?.length || res.data?.items?.length || Object.keys(res.data || {}).length);
    const list = Array.isArray(res.data) ? res.data : (res.data?.items || []);
    console.log('Sample designer structure from /designer/all (Item 0):', JSON.stringify(list[0], null, 2));
    console.log('Sample designer structure from /designer/all (Item 1):', JSON.stringify(list[1], null, 2));
  } catch (e: any) {
    console.log(' -> FAIL! Status:', e.response?.status, e.message);
  }
}

run();
