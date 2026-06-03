import axios from 'axios';

async function run() {
  const coreBase = 'http://localhost:3000/api/core';

  try {
    console.log('Fetching designer list...');
    const listRes = await axios.get(`${coreBase}/admin/designers`, { params: { size: 5 } });
    const items = listRes.data?.items || listRes.data?.content || listRes.data || [];
    console.log(`Found ${items.length} designers.`);

    for (const item of items) {
      const id = item.id || item.accountId;
      console.log(`\n---------------------------------`);
      console.log(`Fetching detail for Designer ID: ${id}`);
      try {
        const detailRes = await axios.get(`${coreBase}/admin/designer`, { params: { designerId: id } });
        console.log(JSON.stringify(detailRes.data, null, 2));
      } catch (err: any) {
        console.log(`Failed to fetch detail for ${id}:`, err.message);
      }
    }
  } catch (e: any) {
    console.log('Error fetching list:', e.response?.status, e.message);
  }
}

run();
