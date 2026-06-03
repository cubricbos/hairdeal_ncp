import axios from 'axios';

async function probe() {
  const dto = {
    mobileNumber: '01011112222',
    verifyNumber: '123456',
    name: 'DTO Test',
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

  const urls = [
      'http://account.cubric.io/api/account',
      'http://account.cubric.io/api/designer',
      'http://account.cubric.io/api/account/sign-up',
      'http://account.cubric.io/api/designers',
      'http://account.cubric.io/api/account/designer',
      'http://account.cubric.io/api/auth/signup',
      'http://account.cubric.io/api/sign-up'
  ];

  for (const url of urls) {
      try {
        console.log('Testing URL:', url);
        const res = await axios.post(url, dto);
        console.log('SUCCESS:', url, res.status);
        console.log('DATA:', res.data);
        return;
      } catch (err: any) {
        console.log('FAIL:', url, err.response?.status, err.response?.data);
      }
  }
}

probe();
