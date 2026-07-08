import axios from 'axios';
import jwt from 'jsonwebtoken';
async function run() {
  const realId = '277a6532968840169d89501b7bfa1dbd'; 
  const key = '0cub6zbqmflr0ric1d';
  const token = jwt.sign({ id: realId }, key, { algorithm: 'HS256' });
  const client = axios.create({
    baseURL: 'http://hairdeal.cubric.io/api',
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const designerId = '277a6532968840169d89501b7bfa1dbd'; // or some valid ID
  const urls = [
    `/admin/designer/${designerId}/credit-histories`,
    `/admin/designer/${designerId}/credit_history`,
    `/admin/credit-histories`,
    `/admin/designer/credit-histories`
  ];

  for (let url of urls) {
    try {
      const res = await client.get(url, { params: { designerId } });
      console.log("SUCCESS", url, res.status);
    } catch (e: any) {
      console.log("FAIL", url, e.response?.status);
    }
  }
}
run();
