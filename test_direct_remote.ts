import axios from 'axios';

async function run() {
  const accountBase = 'http://account.cubric.io/api/designer';

  const makeId = () => Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  const payload = {
    id: makeId(),
    email: `direct_rem_${Date.now()}@example.com`,
    password: 'Password123!',
    name: '원격직접자',
    mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
    role: '디자이너',
    hairShop: {
      id: makeId(),
      name: '원격매장',
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
    console.log('Sending direct REMOTE payload to http://account.cubric.io/api/designer...');
    const res = await axios.post(accountBase, payload);
    console.log(' -> SUCCESS! Status:', res.status, res.data);
  } catch (e: any) {
    console.log(' -> FAIL! Status:', e.response?.status);
    console.log('Error info:', JSON.stringify(e.response?.data));
  }
}

run();
