import axios from 'axios';
import jwt from 'jsonwebtoken';

async function run() {
  const targetId = '277a6532968840169d89501b7bfa1dbd';
  
  try {
    const res = await axios.get('http://localhost:3000/api/admin/user-credit-history', {
      headers: { Authorization: `Bearer ey...` }, // need a valid supabase token? wait, let's just bypass supabase auth in the test or use a mock
      params: { designerId: targetId }
    });
    console.log("Success! Status:", res.status);
    console.log("Data:", JSON.stringify(res.data).substring(0, 200));
  } catch (e: any) {
    console.log("Fail:", e.response?.status, JSON.stringify(e.response?.data));
  }
}
run();
