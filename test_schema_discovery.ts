import axios from 'axios';

async function run() {
  const accountBase = 'http://localhost:3000/api/account/designer';

  const makeId = () => Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  const experiments = [
    {
      name: "Random 32-char hex ID, role='디자이너', with basic hairShop",
      payload: {
        id: makeId(),
        email: `disc_${Date.now()}_1@example.com`,
        password: 'Password123!',
        passwordConfirm: 'Password123!',
        name: '실험자일',
        mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
        role: '디자이너',
        hairShop: {
          name: '실험매장일',
          address: '인천 서구 가정동'
        }
      }
    },
    {
      name: "Random 32-char hex ID, role='DESIGNER', with basic hairShop",
      payload: {
        id: makeId(),
        email: `disc_${Date.now()}_2@example.com`,
        password: 'Password123!',
        passwordConfirm: 'Password123!',
        name: '실험자이',
        mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
        role: 'DESIGNER',
        hairShop: {
          name: '실험매장이',
          address: '인천 서구 가정동'
        }
      }
    },
    {
      name: "Random 32-char hex ID, no role, with basic hairShop",
      payload: {
        id: makeId(),
        email: `disc_${Date.now()}_3@example.com`,
        password: 'Password123!',
        passwordConfirm: 'Password123!',
        name: '실험자삼',
        mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
        hairShop: {
          name: '실험매장삼',
          address: '인천 서구 가정동'
        }
      }
    },
    {
      name: "Random 32-char hex ID, role='디자이너', no passwordConfirm, with basic hairShop",
      payload: {
        id: makeId(),
        email: `disc_${Date.now()}_4@example.com`,
        password: 'Password123!',
        name: '실험자사',
        mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
        role: '디자이너',
        hairShop: {
          name: '실험매장사',
          address: '인천 서구 가정동'
        }
      }
    },
    {
      name: "NO ID, role='디자이너', with basic hairShop",
      payload: {
        email: `disc_${Date.now()}_5@example.com`,
        password: 'Password123!',
        passwordConfirm: 'Password123!',
        name: '실험자오',
        mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
        role: '디자이너',
        hairShop: {
          name: '실험매장오',
          address: '인천 서구 가정동'
        }
      }
    },
    {
      name: "Random 32-char hex ID, role='디자이너', with empty business fields in hairShop",
      payload: {
        id: makeId(),
        email: `disc_${Date.now()}_6@example.com`,
        password: 'Password123!',
        passwordConfirm: 'Password123!',
        name: '실험자육',
        mobileNumber: '010' + Math.floor(10000000 + Math.random() * 90000000),
        role: '디자이너',
        hairShop: {
          name: '실험매장육',
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
      }
    }
  ];

  for (const exp of experiments) {
    try {
      console.log(`\n=== Running: ${exp.name} ===`);
      const res = await axios.post(accountBase, exp.payload);
      console.log(`SUCCESS! Status: ${res.status}`);
      console.log('Response:', JSON.stringify(res.data, null, 2));
    } catch (e: any) {
      console.log(`FAILED! Status: ${e.response?.status}`);
      console.log('Error info:', JSON.stringify(e.response?.data, null, 2));
    }
  }
}

run();
