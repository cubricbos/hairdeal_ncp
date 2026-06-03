import axios from 'axios';
async function probe() {
  const url = 'http://account.cubric.io/api/designer';
  const myMobile = `010${Math.floor(Math.random() * 89999999 + 10000000)}`;
  const dto = {
    mobileNumber: myMobile,
    verifyNumber: '123456',
    name: 'Designer Test',
    email: `designer_${Date.now()}@example.com`,
    gender: 'Female',
    birthday: '1990-01-01T00:00:00Z',
    signedBy: 'Email',
    socialLoginId: null,
    isServiceTermsAgreed: true,
    isPrivacyPolicyAgreed: true,
    isLocationServiceTermsAgreed: true,
    isMarketingTermsAgreed: false,
    referralCode: null
  };
  try {
    await axios.post(url, dto);
    
    // minimal upsert fallback to login
    const minDto = {
        mobileNumber: myMobile,
        verifyNumber: '123456',
        name: dto.name,
        email: dto.email,
        gender: dto.gender,
        birthday: dto.birthday,
        signedBy: dto.signedBy,
        isServiceTermsAgreed: true,
        isPrivacyPolicyAgreed: true,
        isLocationServiceTermsAgreed: true,
        isMarketingTermsAgreed: false
    };
    const minRes = await axios.post('http://account.cubric.io/api/account', minDto);
    console.log('MINIMAL UPSERT STATUS:', minRes.status);
    console.log('MINIMAL UPSERT HEADERS:', Object.keys(minRes.headers).filter(k => k.includes('cubric')));
  } catch(e: any) { 
      console.log('FAIL:', e.response?.status, e.response?.data);
  }
}
probe();
