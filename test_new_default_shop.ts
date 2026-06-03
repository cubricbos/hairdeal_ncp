import axios from 'axios';
async function run() {
  const accountBase = 'http://localhost:3000/api/account/designer';

  // Generate unique 32-char hex IDs
  const userHexId = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  const shopHexId = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  const payload = {
    id: userHexId,
    name: '자동테스터',
    role: '디자이너',
    mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
    email: `auto_${Date.now()}@example.com`,
    password: 'Password123!',
    passwordConfirm: 'Password123!',
    hairShop: {
      id: shopHexId,
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
    console.log('Sending payload with Unregistered Shop structure:');
    const res = await axios.post(accountBase, payload);
    console.log('SUCCESS REGISTERING:', res.status, res.data);
  } catch(e: any) {
    console.log('FAILED REGISTERING:', e.response?.status, JSON.stringify(e.response?.data, null, 2));
  }
}
run();
