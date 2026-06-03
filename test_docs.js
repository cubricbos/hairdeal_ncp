import axios from 'axios';

async function test() {
  const accountBaseURL = process.env.VITE_NCP_ACCOUNT_URL || 'http://49.50.133.211:8081';

  try {
    const res = await axios.get(`${accountBaseURL}/v3/api-docs`);
    console.log(Object.keys(res.data.paths).filter(p => !p.includes('{')));
  } catch(e) {
    console.log('Error docs:', e.message);
  }
}
test();
