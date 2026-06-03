import axios from 'axios';
async function test() {
  const accountBase = 'http://localhost:3000/api/account/designer';
  
  const payload = {
    email: `test_${Date.now()}@example.com`,
    password: "Password123!",
    passwordConfirm: "Password123!",
    name: "헤어딜",
    role: "DESIGNER",
    mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
    hairShop: {
      name: "가산헤어",
      number: "01012341234",
      sido: "서울",
      sigungu: "금천구",
      bname: "독산동",
      address: "서울 금천구 독산동 148-5",
      roadAddress: "서울 금천구 시흥대로145길 35",
      addressDetail: "ㅇㅇ",
      zoneCode: "08533",
      location: {
        latitude: 37.4742089128496,
        longitude: 126.895012271346
      },
      businessNumber: ""
    }
  };

  try {
     const r = await axios.post(accountBase, payload);
     console.log('Success POST', r.status);
  } catch (e: any) {
     console.log('Fail POST', e.response?.status, e.response?.data);
  }
}
test();
