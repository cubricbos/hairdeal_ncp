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
    const res = await axios.post(url, dto);
    console.log('CREATE SUCCESS:', res.status, res.headers['x-cubric-authorization-token']);
    
    // Now try to login!
    const loginDto = {
        mobileNumber: myMobile,
        verifyNumber: '123456'
    };
    try {
        const loginRes = await axios.post('http://account.cubric.io/api/account/login', loginDto);
        console.log('LOGIN SUCCESS:', loginRes.status, loginRes.headers['x-cubric-authorization-token']);
    } catch(e: any) {
        console.log('LOGIN FAIL:', e.response?.status, e.response?.data);
    }
  } catch (err: any) {
    console.log('CREATE FAIL:', err.response?.status, err.response?.data);
  }
}
probe();
