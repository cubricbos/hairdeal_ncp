import axios from 'axios';
async function test() {
  try {
     const payload = {
       name: '자동테스터',
       role: '디자이너',
       mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
       email: `direct_${Date.now()}@example.com`,
       password: 'Password123!',
       passwordConfirm: 'Password123!',
       hairShop: {
         name: "미등록 매장",
         number: "01000000000",
         sido: "",
         sigungu: "",
         bname: "",
         address: "",
         roadAddress: "",
         addressDetail: "미등록 매장 주소",
         zoneCode: "",
         location: {
           latitude: 0,
           longitude: 0
         },
         businessNumber: ""
       }
     };

     const res = await axios.post('http://account.cubric.io/api/designer', payload);
     console.log('DIRECT NCP RESPONSE:', res.status, res.data);
  } catch(e: any) {
     console.log('DIRECT NCP FAIL:', e.message, e.response?.status, JSON.stringify(e.response?.data));
  }
}
test();
