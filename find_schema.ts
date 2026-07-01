import axios from 'axios';

async function run() {
  const accountBase = 'http://localhost:3000/api/account/designer';

  const userHexId = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  const shopHexId = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  const createPayload = {
    id: userHexId,
    name: '완벽필드테스터',
    role: '디자이너',
    mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
    email: `complete_${Date.now()}@example.com`,
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
      businessNumber: "",
      confirmedAt: null,
      rejectedAt: null,
      rejectReason: null
    },
    businessFile: null,
    businessTimes: [null, null, null, null, null, null, null],
    holidays: []
  };

  let token = null;
  try {
    const signupRes = await axios.post(accountBase, createPayload);
    token = signupRes.headers['x-cubric-designer-token'] || signupRes.headers['authorization'];
  } catch(e:any) {
    console.log("Signup failed:", e.response?.data);
    return;
  }

  const coreClient = axios.create({ 
      baseURL: 'http://localhost:3000/api/core',
      headers: { Authorization: token.startsWith('Bearer') ? token : `Bearer ${token}` }
  });

  const basePayload = {
    shopName: "테스트",
    shopNumber: "01012345678",
    addressDetail: "상세주소",
    address: {
      sido: "서울",
      sigungu: "강남구",
      bname: "역삼동",
      address: "서울",
      roadAddress: "서울",
      zonecode: "",
      latitude: 0,
      longitude: 0
    },
    businessTimes: [null, null, null, null, null, null, null],
    holidays: []
  };

  const tests = [
    { name: "default", payload: basePayload },
    { name: "businessTimes explicit idx", payload: { ...basePayload, businessTimes: [{ weekday: 0, startedAt: "10:00", endedAt: "20:00" }, null, null, null, null, null, null] } }
  ];

  for (const t of tests) {
    try {
      await coreClient.post('/designer/management', t.payload);
      console.log(t.name, "SUCCESS!!!!!");
      break;
    } catch (e: any) {
      console.log(t.name, "FAIL:", e.response?.status, JSON.stringify(e.response?.data, null, 2));
    }
  }
}
run();
