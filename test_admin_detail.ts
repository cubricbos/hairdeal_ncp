import { accountClient, apiClient } from './src/lib/ncpClient.js';
import axios from 'axios';

async function test() {
  try {
    const res = await axios.get('http://localhost:3000/api/core/admin/designers');
    const items = res.data.items;
    console.log(`Found ${items.length} designers. Fetching detail for first 3...`);
    
    for (let i = 0; i < Math.min(3, items.length); i++) {
        const detailRes = await axios.get('http://localhost:3000/api/core/admin/designer', {
          params: { designerId: items[i].id }
        });
        console.log(`id: ${items[i].id}, phone:`, detailRes.data.mobileNumber);
    }
  } catch(e: any) {
    console.log('failed:', e.response?.status, e.response?.data);
  }
}
test();
