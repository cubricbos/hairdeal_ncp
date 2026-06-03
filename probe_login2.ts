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
    signedBy: 'Email', // maybe signedBy: 'Mobile'?
    socialLoginId: null,
    isServiceTermsAgreed: true,
    isPrivacyPolicyAgreed: true,
    isLocationServiceTermsAgreed: true,
    isMarketingTermsAgreed: false,
    referralCode: null
  };

  try {
    const res = await axios.post(url, dto);
    
    // Attempt logins
    const loginPayloads = [
      { mobileNumber: myMobile, verifyNumber: '123456' },
      { mobileNumber: myMobile, verifyNumber: '123456', signedBy: 'Email' },
      { mobileNumber: myMobile, verifyNumber: '123456', signedBy: 'Mobile', socialLoginId: null },
      { email: dto.email, verifyNumber: '123456' },
      { mobileNumber: myMobile, password: 'password' },
    ];
    for (const p of loginPayloads) {
        try {
            const loginRes = await axios.post('http://account.cubric.io/api/account/login', p);
            console.log('LOGIN SUCCESS:', p, loginRes.status);
        } catch(e: any) {
            console.log('LOGIN FAIL:', p, e.response?.status, e.response?.data);
        }
    }
  } catch (err: any) {
    console.log('CREATE FAIL:', err.response?.status, err.response?.data);
  }
}
probe();
