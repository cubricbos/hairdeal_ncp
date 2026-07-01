import axios from 'axios';

async function test_designer() {
  const url = 'http://localhost:3000/api/core/designer/management';
  
  // We need a logged in token.
  const loginRes = await axios.post('http://localhost:3000/api/core/auth/login', {
    loginId: '01021170601',
    password: 'Password123!'
  });
  
  const token = loginRes.headers['authorization'] || loginRes.headers['x-cubric-authorization-token'];
  
  const payload = {
    shopName: "테스트",
    shopNumber: "01000000000",
    addressDetail: "매장 주소",
    address: {
      sido: "",
      sigungu: "",
      bname: "",
      address: "서울",
      roadAddress: "서울",
      zonecode: "",
      latitude: 0,
      longitude: 0
    },
    businessTimes: [null, null, null, null, null, null, null],
    holidays: []
  };

  try {
    const res = await axios.post(url, payload, { headers: { Authorization: token }});
    console.log("Success:", res.data);
  } catch(e: any) {
    console.log("Error status:", e.response?.status);
    console.log("Error data:", JSON.stringify(e.response?.data, null, 2));
  }
}
test_designer();
