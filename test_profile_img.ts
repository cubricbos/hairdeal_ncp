import axios from 'axios';

async function run() {
     const loginRes2 = await axios.post('http://localhost:3000/api/account/designer/login/mobile', { mobileNumber: '01055225522', verifyNumber: '111111' });
     const token2 = loginRes2.headers['x-cubric-designer-token'] || loginRes2.headers['authorization'];
     if (token2) {
        try {
           const detail = await axios.get('http://localhost:3000/api/account/designer/detail', {
              headers: { Authorization: `Bearer ${token2.replace('Bearer ', '')}` }
           });
           console.log("Detail Keys:", Object.keys(detail.data));
           console.log("Data:", detail.data);
           console.log("Image URL:", detail.data.imageUrl, detail.data.profileImageUrl, detail.data.image, detail.data.avatar);
           console.log("Email:", detail.data.email);
        } catch (e: any) {
           console.log("Detail ERROR", e?.response?.status);
           if (e?.response?.status === 404) {
               try {
                   const detail2 = await axios.get('http://localhost:3000/api/account/api/designer/detail', {
                      headers: { Authorization: `Bearer ${token2.replace('Bearer ', '')}` }
                   });
                   console.log("Detail2 Keys:", Object.keys(detail2.data));
                   console.log("Data2:", detail2.data);
               } catch (e2: any) {}
           }
        }
     }
}
run();
