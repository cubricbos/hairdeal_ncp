import axios from 'axios';

async function run() {
  try {
    const res = await axios.get('http://localhost:3000/api/core/admin/designers');
    const items = res.data.items || [];
    console.log(`TOTAL DESIGNERS: ${items.length}`);
    for (const item of items) {
      try {
        const detailRes = await axios.get(`http://localhost:3000/api/core/admin/designer?designerId=${item.id}`);
        console.log(`ID: ${item.id}, Name: ${item.name}, Email: ${detailRes.data.email}, Phone: ${detailRes.data.mobileNumber}`);
      } catch (err) {
        console.log(`ID: ${item.id} (failed to fetch details)`);
      }
    }
  } catch (e: any) {
    console.log('ERROR:', e.message);
  }
}

run();
