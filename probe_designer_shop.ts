import axios from 'axios';

async function probe() {
  const url = 'http://account.cubric.io/api/designer';
  const dto = {
    mobileNumber: `010${Math.floor(Math.random() * 89999999 + 10000000)}`,
    verifyNumber: '123456',
    name: 'Designer Shop Test',
    email: `designer_shop${Date.now()}@example.com`,
    gender: 'Female',
    birthday: '1990-01-01T00:00:00Z',
    signedBy: 'Email',
    socialLoginId: null,
    isServiceTermsAgreed: true,
    isPrivacyPolicyAgreed: true,
    isLocationServiceTermsAgreed: true,
    isMarketingTermsAgreed: false,
    referralCode: null,
    
    // Add old designer fields
    role: '디자이너',
    businessFile: null,
    businessTimes: [null, null, null, null, null, null, null],
    holidays: [],
    hairShop: {
      id: "shop_" + Date.now(),
      name: 'Test Shop',
      address: 'Test Address',
      number: '01000000000',
      businessNumber: "",
      confirmedAt: new Date().toISOString(),
      rejectedAt: null,
      rejectReason: null
    }
  };

  try {
    const res = await axios.post(url, dto);
    console.log('DESIGNER CREATE SUCCESS:', res.status);
    const token = res.headers['x-cubric-authorization-token'];
    
    // Attempt detail
    try {
        const detailRes = await axios.get('http://account.cubric.io/api/designer/detail', {
            headers: {
                'x-cubric-authorization-token': token,
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('DESIGNER DETAIL SUCCESS:', detailRes.data);
    } catch(e: any) {
        console.log('DESIGNER DETAIL FAIL:', e.response?.status, e.response?.data);
    }
  } catch (err: any) {
    console.log('DESIGNER CREATE FAIL:', err.response?.status, err.response?.data);
  }
}
probe();
