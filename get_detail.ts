import axios from 'axios';

async function run() {
     const loginRes2 = await axios.post('http://account.cubric.io/api/designer/login/mobile', { mobileNumber: '01055225522', verifyNumber: '111111' });
     const token2 = loginRes2.headers['x-cubric-designer-token'] || loginRes2.headers['authorization'];
     if (token2) {
        const detail = await axios.get('http://account.cubric.io/api/designer/detail', {
            headers: { Authorization: `Bearer ${token2.replace('Bearer ', '')}` }
        });
        console.log("Designer Detail Keys:", Object.keys(detail.data));
        console.log("Designer Detail:", JSON.stringify(detail.data, null, 2));
     }
}
run();
