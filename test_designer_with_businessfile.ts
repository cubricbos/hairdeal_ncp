import axios from 'axios';

async function run() {
  const accountBase = 'http://localhost:3000/api/account/designer';

  // ID must be 32 char hex
  const payload = {
    id: 'c2c289a28d76425894adaec4d9e9821a',
    name: '사업자테스터',
    role: '디자이너',
    mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
    email: `biz_${Date.now()}@example.com`,
    password: 'Password123!',
    hairShop: {
      id: 'd2c289a28d76425894adaec4d9e9821b',
      name: '새로운매장',
      number: '01055240911',
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
      businessNumber: '123-45-67890'
    },
    businessFile: {
      id: 'e2c289a28d76425894adaec4d9e9821c',
      bucketName: 'cubric-storage',
      details: [
        'c9e217aa-cbee-4b47-b7d8-b8af86677b9e.png'
      ],
      fileType: 'IMAGE',
      createdAt: '2025-09-30T09:26:52Z',
      updatedAt: '2025-09-30T09:26:52Z'
    }
  };

  try {
    console.log('Sending payload with businessFile:', JSON.stringify(payload, null, 2));
    const res = await axios.post(accountBase, payload);
    console.log('SUCCESS:', res.status, res.data);
  } catch(e: any) {
    console.log('FAILED:', e.response?.status, JSON.stringify(e.response?.data, null, 2));
  }
}
run();
