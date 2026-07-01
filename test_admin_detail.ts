import { accountClient, apiClient } from './src/lib/ncpClient.js';
import axios from 'axios';

async function test() {
  try {
    const detailRes = await axios.get('http://localhost:3000/api/core/admin/designer', {
      params: { designerId: 'd2c289a28d76425894adaec4d9e9820a' }
    });
    console.log(JSON.stringify(detailRes.data, null, 2));
  } catch(e: any) {
    console.log('failed:', e.response?.status, e.response?.data);
  }
}
test();
