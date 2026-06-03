import axios from 'axios';

async function run() {
  const accountBase = 'http://localhost:3000/api/account/designer';

  const cleanNum = () => '010' + Math.floor(10000000 + Math.random() * 90000000);

  const payload = {
    email: `noid_gmail_${Date.now()}@gmail.com`,
    password: 'Password123!',
    passwordConfirm: 'Password123!',
    name: '한글네임',
    mobileNumber: cleanNum(),
    role: '디자이너',
    hairShop: {
      name: '미등록 매장',
      number: '01000000000',
      sido: '',
      sigungu: '',
      bname: '',
      address: '',
      roadAddress: '',
      addressDetail: '미등록 매장 주소',
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
    console.log('Sending payload (No ID, Gmail domain)...');
    const res = await axios.post(accountBase, payload);
    console.log(' -> SUCCESS:', res.status, res.data);
  } catch (e: any) {
    console.log(' -> FAIL STATUS:', e.response?.status, JSON.stringify(e.response?.data));
  }
}

run();
