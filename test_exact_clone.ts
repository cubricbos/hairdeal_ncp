import axios from 'axios';

async function run() {
  const accountBase = 'http://account.cubric.io/api/designer';

  // Exact fields cloned from the successful designer shown in details
  const payload = {
    id: 'a' + Math.floor(1000000000000000000000000000000 + Math.random() * 9000000000000000000000000000000).toString(16), // 32-char hex
    name: '복제테스터',
    role: '디자이너',
    mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
    email: `clone_${Date.now()}@privaterelay.appleid.com`,
    password: 'Password123!',
    hairShop: {
      id: 'b' + Math.floor(1000000000000000000000000000000 + Math.random() * 9000000000000000000000000000000).toString(16), // 32-char hex
      name: '복제매장',
      number: '010' + Math.floor(10000000 + Math.random() * 90000000),
      sido: '인천',
      sigungu: '서구',
      bname: '가정동',
      address: '인천 서구 가정로336번길 1-4',
      roadAddress: '인천 서구 가정로336번길 1-4',
      addressDetail: '',
      zoneCode: '22783',
      location: {
        latitude: 37.5149083777382,
        longitude: 126.673130660253
      },
      businessNumber: '123-45-67890',
      confirmedAt: null,
      rejectedAt: null,
      rejectReason: null
    }
  };

  while (payload.id.length < 32) payload.id += '0';
  while (payload.hairShop.id.length < 32) payload.hairShop.id += '0';

  payload.id = payload.id.substring(0, 32);
  payload.hairShop.id = payload.hairShop.id.substring(0, 32);

  try {
    console.log('Sending exact clone payload:', JSON.stringify(payload, null, 2));
    const res = await axios.post(accountBase, payload);
    console.log('SUCCESS:', res.status, res.data);
  } catch(e: any) {
    console.log('FAILED:', e.response?.status, JSON.stringify(e.response?.data, null, 2));
  }
}
run();
