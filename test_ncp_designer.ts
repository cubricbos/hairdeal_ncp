import axios from 'axios';
async function test() {
  const payload = {
    email: `test_direct_${Date.now()}@example.com`,
    password: "Password123!",
    passwordConfirm: "Password123!",
    name: "홍길동",
    role: "디자이너",
    mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
    commission: 1.5,
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
      businessNumber: "1234567890"
    }
  };
  try {
    const res = await axios.post('http://localhost:3000/api/account/designer', payload);
    console.log("Success:", res.data);
  } catch (err: any) {
    if (err.response?.status === 400 && err.response.data?.errors) {
       console.error("Failed 400 with details:", err.response.data.errors);
    } else {
       console.error("Failed:", err.response?.data || err.message);
    }
  }
}
test();
