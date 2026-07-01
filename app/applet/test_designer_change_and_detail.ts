import axios from 'axios';

async function run() {
  try {
    const loginRes = await axios.post('http://account.cubric.io/api/designer/login', {
      email: 'dev@cubric.io',
      password: 'password'
    });
    const token = loginRes.headers['x-cubric-designer-token'] || loginRes.headers['authorization'];
    console.log("Logged in, token:", token ? "Yes" : "No");
    
    if (token) {
        const detail = await axios.get('http://account.cubric.io/api/designer/detail', {
            headers: { Authorization: `Bearer ${token.replace('Bearer ', '')}` }
        });
        console.log("Designer Detail Keys:", Object.keys(detail.data));
        console.log("Designer Detail:", JSON.stringify(detail.data, null, 2));
    }
  } catch(e: any) {
    if (e.response?.status === 401) {
       console.log("Login failed with normal password. Trying mobile...");
       const loginRes2 = await axios.post('http://account.cubric.io/api/designer/login/mobile', { mobileNumber: '01055225522', verifyNumber: '111111' });
       const token2 = loginRes2.headers['x-cubric-designer-token'] || loginRes2.headers['authorization'];
       if (token2) {
          const detail = await axios.get('http://account.cubric.io/api/designer/detail', {
             headers: { Authorization: `Bearer ${token2.replace('Bearer ', '')}` }
          });
          console.log("Designer Detail Keys:", Object.keys(detail.data));
          console.log("Designer Detail:", JSON.stringify(detail.data, null, 2));
       }
    } else {
       console.log("Error:", e?.response?.status, e?.response?.data);
    }
  }
}
run();
