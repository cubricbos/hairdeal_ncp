import axios from 'axios';
async function run() {
  const accountBase = 'http://localhost:3000/api/account/designer';
  
  const payload = {
    id: 'testf' + Date.now().toString(16),
    email: `test_full_${Date.now()}@example.com`,
    password: 'Password123!',
    name: '테스터풀',
    mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
    role: '디자이너',
    hairShop: {
      name: '가산헤어테스트',
      number: '01012341234',
      sido: '서울',
      sigungu: '금천구',
      bname: '독산동',
      address: '서울 금천구 독산동 148-5',
      roadAddress: '서울 금천구 시흥대로145길 35',
      addressDetail: '101호',
      zoneCode: '08533',
      location: {
        latitude: 37.4742089128496,
        longitude: 126.895012271346
      },
      businessNumber: ''
    }
  };

  try {
    console.log('Posting payload:', JSON.stringify(payload, null, 2));
    const res = await axios.post(accountBase, payload);
    console.log('SUCCESS status:', res.status, 'data:', res.data);
  } catch (e: any) {
    console.log('FAILED. Status:', e.response?.status);
    console.log('Error Body:', JSON.stringify(e.response?.data, null, 2));
  }
}
run();
