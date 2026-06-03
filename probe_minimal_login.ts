import axios from 'axios';
async function probe() {
  const url = 'http://account.cubric.io/api/account';
  const myMobile = `010${Math.floor(Math.random() * 89999999 + 10000000)}`;
  const dto = {
    mobileNumber: myMobile,
    verifyNumber: '123456',
    name: 'Login Test',
    email: `dto${Date.now()}@example.com`,
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
    
    // Now try to "login" with a minimal payload
    const minimalDto = {
        mobileNumber: myMobile,
        verifyNumber: '123456',
        name: 'Login Test',
        email: `dto${Date.now()}@example.com`, // We don't have original email in UI, maybe invent one?
        gender: "Female",
        birthday: "1990-01-01T00:00:00Z",
        signedBy: "Email",
        isServiceTermsAgreed: true,
        isPrivacyPolicyAgreed: true,
        isLocationServiceTermsAgreed: true,
        isMarketingTermsAgreed: false
    };
    try {
        const res2 = await axios.post(url, minimalDto);
        console.log('MINIMAL LOGIN SUCCESS:', res2.status, res2.headers['x-cubric-authorization-token']);
    } catch(e: any) {
        console.log('MINIMAL LOGIN FAIL:', e.response?.status, e.response?.data);
    }
  } catch (err: any) {
    console.log('CREATE FAIL:', err.response?.status, err.response?.data);
  }
}
probe();
