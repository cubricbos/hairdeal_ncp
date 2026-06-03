import axios from 'axios';

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function run() {
  const accountBase = 'http://localhost:3000/api/account/designer';

  const cleanNum = () => '010' + Math.floor(10000000 + Math.random() * 90000000);

  const payload = {
    id: uuidv4(),
    name: "유아이디테스터",
    role: "디자이너",
    mobileNumber: cleanNum(),
    email: `uuid_${Date.now()}_test@gmail.com`,
    password: "Password123!",
    hairShop: {
      id: uuidv4(),
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
    console.log('Sending payload with perfectly valid UUID v4 (with hyphens)...');
    console.log('Payload:', JSON.stringify(payload, null, 2));
    const res = await axios.post(accountBase, payload);
    console.log(' -> SUCCESS! Status:', res.status, res.data);
  } catch (e: any) {
    console.log(' -> FAIL! Status:', e.response?.status);
    console.log('Error info:', JSON.stringify(e.response?.data));
  }
}

run();
