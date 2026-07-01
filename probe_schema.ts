import axios from 'axios';

async function test() {
  const accountBase = 'http://localhost:3000/api/account/designer';

  let token = null;
  // 1. Create a dummy designer to get token
  try {
    const signupRes = await axios.post(accountBase, {
      id: Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      name: '테스터',
      role: '디자이너',
      mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
      email: `test_${Date.now()}@test.com`,
      password: 'Password123!',
      passwordConfirm: 'Password123!',
      businessTimes: [null, null, null, null, null, null, null],
      holidays: []
    });
    token = signupRes.headers['x-cubric-designer-token'] || signupRes.headers['authorization'];
  } catch(e:any) {
    console.log("Signup failed:", e.response?.data);
  }

  if(!token) return;

  const coreClient = axios.create({ 
      baseURL: 'http://localhost:3000/api/core',
      headers: { Authorization: token.startsWith('Bearer') ? token : `Bearer ${token}` }
  });

  const accountClient = axios.create({ 
      baseURL: 'http://localhost:3000/api/account',
      headers: { Authorization: token.startsWith('Bearer') ? token : `Bearer ${token}` }
  });

  const payload = {
    shopName: "테스트샵",
    shopNumber: "01000000000",
    addressDetail: "상세",
    address: {
      sido: "서울",
      sigungu: "강남구",
      bname: "역삼동",
      address: "서울 강남구 역삼동",
      roadAddress: "서울 강남구 역삼로",
      zonecode: "", // try zonecode vs zoneCode
      latitude: 0,
      longitude: 0
    },
    businessTimes: [null, null, null, null, null, null, null],
    holidays: []
  };

  try {
      console.log("Trying /designer/management ...");
      await coreClient.post('/designer/management', payload);
      console.log("Core management SUCCESS!");
  } catch (e:any) {
      console.log("Core management FAIL 400: ", JSON.stringify(e.response?.data, null, 2));
  }

  const accountPayload = {
      name: "테스트",
      number: "0100000",
      sido: "",
      sigungu: "",
      bname: "",
      address: "서울",
      roadAddress: "서울",
      addressDetail: "상세",
      zoneCode: "",
      latitude: 0,
      longitude: 0,
      businessNumber: ""
  };
  
  try {
      console.log("Trying Account /hair-shop ...");
      await accountClient.post('/designer/hair-shop', accountPayload);
      console.log("Account /designer/hair-shop SUCCESS!");
  } catch (e:any) {
      console.log("Account /designer/hair-shop FAIL: ", JSON.stringify(e.response?.data, null, 2));
  }
}
test();
