import axios from 'axios';

async function test() {
  const accountBaseURL = process.env.VITE_NCP_ACCOUNT_URL || 'http://49.50.133.211:8081';

  const tryUrl = async (url) => {
    try {
      const res = await axios.get(url, { timeout: 2000 });
      console.log(`Success ${url}:`, Array.isArray(res.data) ? res.data.length : res.data);
    } catch (e) {
      console.log(`Failed ${url}:`, e.response?.status || e.message);
    }
  }

  await tryUrl(`${accountBaseURL}/admin/users`);
  await tryUrl(`${accountBaseURL}/users`);
  await tryUrl(`${accountBaseURL}/designer/list`);
}

test();
