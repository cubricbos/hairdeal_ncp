import axios from 'axios';

async function run() {
  const accountBase = 'http://localhost:3000/api/account/designer';

  // 1. Generate a valid 32-char hex matching user uuid
  const hex32Id = 'e2c289a28d76425894adaec4d9e9820b'; // 32 chars hex

  const variations = [
    {
      title: 'Valid 32-char hex ID, but NO hairShop',
      payload: {
        id: hex32Id,
        email: `test_no_shop_${Date.now()}@example.com`,
        password: 'Password123!',
        name: '테스터삼이',
        mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
        role: '디자이너'
      }
    },
    {
      title: 'Valid 32-char hex ID, with empty/null hairShop',
      payload: {
        id: hex32Id.replace('b', 'c'),
        email: `test_null_shop_${Date.now()}@example.com`,
        password: 'Password123!',
        name: '테스터삼삼',
        mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
        role: '디자이너',
        hairShop: null
      }
    },
    {
      title: 'Valid 32-char hex ID, basic hairShop {name, address}',
      payload: {
        id: hex32Id.replace('b', 'd'),
        email: `test_basic_shop_${Date.now()}@example.com`,
        password: 'Password123!',
        name: '테스터삼사',
        mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
        role: '디자이너',
        hairShop: {
          name: '가람',
          address: '인천 서구'
        }
      }
    },
    {
      title: 'Valid 32-char hex ID, FULL complete hairShop matching existing designer',
      payload: {
        id: hex32Id.replace('b', 'e'),
        email: `test_full_shop_${Date.now()}@example.com`,
        password: 'Password123!',
        name: '테스터삼오',
        mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
        role: '디자이너',
        hairShop: {
          name: '가람',
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
        }
      }
    }
  ];

  for (const item of variations) {
    try {
      console.log(`Testing variation: ${item.title}`);
      const res = await axios.post(accountBase, item.payload);
      console.log(` -> SUCCESS! Status ${res.status}`);
      return; // Stop if we find a working one!
    } catch (e: any) {
      console.log(` -> FAIL: Status ${e.response?.status}, Error:`, JSON.stringify(e.response?.data));
    }
  }
}
run();
