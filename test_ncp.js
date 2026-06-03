import axios from 'axios';

async function test() {
  const accountBaseURL = process.env.VITE_NCP_ACCOUNT_URL || 'http://49.50.133.211:8081';

  try {
    const res1 = await axios.get(`${accountBaseURL}/admin/designers`);
    console.log('/admin/designers:', res1.data);
  } catch (e) {
    console.log('/admin/designers failed:', e.message);
  }
}

test();
