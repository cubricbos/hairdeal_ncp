import axios from 'axios';

async function test() {
  const accountBaseURL = process.env.VITE_NCP_ACCOUNT_URL || 'http://49.50.133.211:8081';
  const apiBaseURL = 'http://49.50.133.211:8083';

  try {
    const res = await axios.get(`${accountBaseURL}/admin/designers`, { timeout: 3000 });
    console.log('/admin/designers:', res.data.slice(0, 2));
  } catch (e) {
    console.log('/admin/designers failed:', e.response?.status || e.message);
  }

  try {
    const res = await axios.get(`${accountBaseURL}/designer/all`, { timeout: 3000 });
    console.log('/designer/all:', res.data.slice(0, 2));
  } catch (e) {
    console.log('/designer/all failed:', e.response?.status || e.message);
  }
}

test();
