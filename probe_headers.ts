import axios from 'axios';

async function probeHeaders() {
  const url = 'http://account.cubric.io/api/account';
  const dto = {
    mobileNumber: `010${Math.floor(Math.random() * 89999999 + 10000000)}`,
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
    console.log('HEADERS:', res.headers);
    console.log('DATA:', res.data);
  } catch(e) { }
}
probeHeaders();
