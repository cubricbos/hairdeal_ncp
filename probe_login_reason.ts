import axios from 'axios';
async function probe() {
  const url = 'http://account.cubric.io/api/account';
  const myMobile = `010${Math.floor(Math.random() * 89999999 + 10000000)}`;
  const email = `dto${Date.now()}@example.com`;
  const dto = {
    mobileNumber: myMobile,
    verifyNumber: '123456',
    name: 'Login Test',
    email: email,
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
    
    // Now try login
    try {
        const res2 = await axios.post('http://account.cubric.io/api/account/login', {
            email: email,
            password: 'password'
        });
        console.log('LOGIN EMAIL/PASS:', res2.status);
    } catch(e: any) {
        console.log('LOGIN FAIL EMAIL/PASS:', e.response?.status, e.response?.data);
    }
  } catch (err: any) {
    console.log('CREATE FAIL:', err.response?.status, err.response?.data);
  }
}
probe();
