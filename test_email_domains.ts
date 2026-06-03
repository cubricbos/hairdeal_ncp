import axios from 'axios';

async function run() {
  const accountBase = 'http://localhost:3000/api/account/designer';

  const makeId = () => Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  const domains = ['gmail.com', 'naver.com', 'daum.net', 'cubric.io', 'example.com'];

  for (const dom of domains) {
    const payload = {
      id: makeId(),
      email: `dom_${Date.now()}_test@${dom}`,
      password: 'Password123!',
      passwordConfirm: 'Password123!',
      name: '도메인테스터',
      mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
      role: '디자이너',
      hairShop: {
        id: makeId(),
        name: '도메인매장',
        number: '01000000000',
        sido: '',
        sigungu: '',
        bname: '',
        address: '인천 서구',
        roadAddress: '',
        addressDetail: '',
        zoneCode: '',
        location: {
          latitude: 0,
          longitude: 0
        },
        businessNumber: '',
        confirmedAt: null,
        rejectedAt: null,
        rejectReason: null
      }
    };

    try {
      console.log(`Testing email domain: @${dom}`);
      const res = await axios.post(accountBase, payload);
      console.log(` -> SUCCESS for @${dom}:`, res.status, res.data);
    } catch (e: any) {
      console.log(` -> FAIL for @${dom}:`, e.response?.status, JSON.stringify(e.response?.data));
    }
  }
}

run();
