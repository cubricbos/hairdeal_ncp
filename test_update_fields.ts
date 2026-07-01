import axios from 'axios';
import jwt from 'jsonwebtoken';

async function run() {
  const c = axios.create({ baseURL: 'http://account.cubric.io/api' });

  const realId = 'e328fcf2daa441c3a2a9ac206e0d9e0f'; // 이현우
  const key = '0cub6zbqmflr0ric1d';
  const dToken = jwt.sign({ id: realId }, key, { algorithm: 'HS256' });

  c.defaults.headers.common['Authorization'] = `Bearer ${dToken}`;
  c.defaults.headers.common['x-cubric-designer-token'] = dToken;
  c.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1';

  let mobileNumber = "01049990044";
  console.log("Token ok", mobileNumber);

  console.log("--- Testing POST /hair-shop ---");
  const shopPayloads = [
    { name: "Shop1", number: mobileNumber },
    { name: "Shop1", number: mobileNumber, address: "Seoul" },
    { name: "Shop1", phone: mobileNumber, address: "Seoul" },
    { hairShopName: "Shop1", mobileNumber },
    { name: "Shop1", number: mobileNumber, addressDetail: "Seoul", latitude: 0, longitude: 0 },
    { shopName: "Shop1", number: mobileNumber },
  ];

  for(const p of shopPayloads) {
    try {
      const res = await c.post('/hair-shop', p);
      console.log("POST /hair-shop OK with:", Object.keys(p).join(','));
      break;
    } catch(e:any) {
      console.log("POST /hair-shop 400 with:", Object.keys(p).join(','), e.response?.data?.message || e.response?.data);
    }
  }

  console.log("--- Testing POST /designer/change ---");
  const fd1 = new FormData();
  fd1.append("nickname", "Test2");
  const fd2 = new FormData();
  fd2.append("name", "Test2");

  try { await c.post('/designer/change', fd1, { headers: { "Content-Type": "multipart/form-data"} }); console.log("fd1 OK"); } catch(e:any) { console.log("fd1 Fail", e.response?.status, e.response?.data); }
  try { await c.post('/designer/change', fd2, { headers: { "Content-Type": "multipart/form-data"} }); console.log("fd2 OK"); } catch(e:any) { console.log("fd2 Fail", e.response?.status, e.response?.data); }
}
run().catch(e => console.error(e.response?.status, e.response?.data));
