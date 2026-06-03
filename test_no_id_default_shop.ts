import axios from 'axios';
async function run() {
  const accountBase = 'http://localhost:3000/api/account/designer';

  const payload = {
    name: '자동없이아이디',
    role: '디자이너',
    mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
    email: `noid_${Date.now()}@example.com`,
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

  try {
    console.log('Sending payload without ID:');
    const res = await axios.post(accountBase, payload);
    console.log('SUCCESS REGISTERING WITHOUT ID:', res.status, res.data);
  } catch(e: any) {
    console.log('FAILED REGISTERING WITHOUT ID:', e.response?.status, JSON.stringify(e.response?.data, null, 2));
  }
}
run();
