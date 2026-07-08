import axios from 'axios';
import jwt from 'jsonwebtoken';
async function run() {
  const realId = '277a6532968840169d89501b7bfa1dbd'; 
  const key = '0cub6zbqmflr0ric1d';
  const token = jwt.sign({ id: realId, roles: ["ROLE_ADMIN"] }, key, { algorithm: 'HS256' });
  const client = axios.create({
    baseURL: 'http://hairdeal.cubric.io/api',
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const designerId = '277a6532968840169d89501b7bfa1dbd';
  const urls = [
    `/admin/credit/history`,
    `/admin/faceswap/credit/history`,
    `/faceswap/credit/admin/history`,
    `/faceswap/credit/history/admin`,
    `/designer/${designerId}/credit/history`,
    `/admin/credit`,
    `/admin/point/history`,
    `/admin/designer/${designerId}/history`
  ];

  for (let url of urls) {
    try {
      const res = await client.get(url, { params: { designerId, size: 50, page: 0 } });
      console.log("SUCCESS", url, res.status);
    } catch (e: any) {
      console.log("FAIL", url, e.response?.status);
    }
  }
}
run();
