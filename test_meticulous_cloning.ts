import axios from 'axios';

async function run() {
  const accountBase = 'http://localhost:3000/api/account/designer';

  const makeId = () => Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  const cleanNum = () => '010' + Math.floor(10000000 + Math.random() * 90000000);

  const payload = {
    id: makeId(),
    name: "복제테스터",
    role: "디자이너",
    mobileNumber: cleanNum(),
    email: `clone_${Date.now()}_test@gmail.com`,
    password: "Password123!",
    hairShop: {
      id: makeId(),
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
      businessNumber: "",
      confirmedAt: null,
      rejectedAt: null,
      rejectReason: null
    },
    businessFile: null,
    businessTimes: [
      null, null, null, null, null, null, null
    ],
    holidays: []
  };

  try {
    console.log('Sending meticulous cloning payload with Gmail and 32-char hex IDs...');
    const res = await axios.post(accountBase, payload);
    console.log(' -> SUCCESS! Status:', res.status, res.data);
  } catch (e: any) {
    console.log(' -> FAIL! Status:', e.response?.status);
    console.log('Error info:', JSON.stringify(e.response?.data));
  }
}

run();
