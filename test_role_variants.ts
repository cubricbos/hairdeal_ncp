import axios from 'axios';

async function run() {
  const accountBase = 'http://localhost:3000/api/account/designer';

  // 32-char hex generator
  const makeId = () => Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  const payloads = [
    {
      title: "No role, 32-char hex IDs, clean email & numbers",
      payload: {
        id: makeId(),
        email: `role_var_norole_${Date.now()}@example.com`,
        password: 'Password123!',
        name: '역할없음',
        mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
        hairShop: {
          id: makeId(),
          name: '역할테스트매장',
          number: '010' + Math.floor(10000000 + Math.random() * 90000000),
          sido: '',
          sigungu: '',
          bname: '',
          address: '서울시',
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
      }
    },
    {
      title: "role='디자이너', 32-char hex IDs, clean email & numbers",
      payload: {
        id: makeId(),
        email: `role_var_ko_${Date.now()}@example.com`,
        password: 'Password123!',
        name: '디자이너한글',
        mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
        role: '디자이너',
        hairShop: {
          id: makeId(),
          name: '역할테스트매장',
          number: '010' + Math.floor(10000000 + Math.random() * 90000000),
          sido: '',
          sigungu: '',
          bname: '',
          address: '서울시',
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
      }
    },
    {
      title: "role='DESIGNER', 32-char hex IDs, clean email & numbers",
      payload: {
        id: makeId(),
        email: `role_var_en_${Date.now()}@example.com`,
        password: 'Password123!',
        name: '디자이너영문',
        mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
        role: 'DESIGNER',
        hairShop: {
          id: makeId(),
          name: '역할테스트매장',
          number: '010' + Math.floor(10000000 + Math.random() * 90000000),
          sido: '',
          sigungu: '',
          bname: '',
          address: '서울시',
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
      }
    },
  ];

  for (const item of payloads) {
    try {
      console.log(`\nTesting: ${item.title}`);
      const res = await axios.post(accountBase, item.payload);
      console.log(` -> SUCCESS! Status ${res.status}`);
      console.log('Response:', res.data);
    } catch(e: any) {
      console.log(` -> FAIL! Status ${e.response?.status}`);
      console.log('Error info:', JSON.stringify(e.response?.data));
    }
  }
}

run();
