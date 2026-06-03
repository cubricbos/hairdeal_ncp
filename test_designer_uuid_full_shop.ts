import axios from 'axios';

async function run() {
  const accountBase = 'http://localhost:3000/api/account/designer';

  const userUuid = '12345678-abcd-1234-abcd-' + Math.floor(100000000000 + Math.random() * 900000000000);
  const shopUuid = '87654321-dbca-4321-dbca-' + Math.floor(100000000000 + Math.random() * 900000000000);

  const payload = {
    id: userUuid,
    name: '유아이디테스터',
    role: '디자이너',
    mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
    email: `uuid_full_${Date.now()}@example.com`,
    password: 'Password123!',
    hairShop: {
      id: shopUuid,
      name: '우주최강헤어',
      number: '01055240911',
      sido: '인천',
      sigungu: '서구',
      bname: '가정동',
      address: '인천 서구 가정로336번길 1-4',
      roadAddress: '인천 서구 가정로336번길 1-4',
      addressDetail: '2층',
      zoneCode: '22783',
      location: {
        latitude: 37.5149083777382,
        longitude: 126.673130660253
      },
      businessNumber: '123-45-67890'
    }
  };

  try {
    console.log('Sending UUID + Full Shop payload:', JSON.stringify(payload, null, 2));
    const res = await axios.post(accountBase, payload);
    console.log('SUCCESS:', res.status, res.data);
  } catch(e: any) {
    console.log('FAILED:', e.response?.status, JSON.stringify(e.response?.data, null, 2));
  }
}
run();
