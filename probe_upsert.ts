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
    const res1 = await axios.post(url, dto);
    console.log('FIRST CREATE SUCCESS:', res1.status);
    
    // Now try it again!
    try {
        const res2 = await axios.post(url, dto);
        console.log('SECOND CREATE (LOGIN) SUCCESS:', res2.status, res2.headers['x-cubric-authorization-token']);
    } catch(e: any) {
        console.log('SECOND CREATE FAIL:', e.response?.status, e.response?.data);
    }
  } catch (err: any) {
    console.log('CREATE FAIL:', err.response?.status, err.response?.data);
  }
}
probe();
