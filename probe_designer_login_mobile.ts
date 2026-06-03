import axios from 'axios';

async function probe() {
  const url = 'http://account.cubric.io/api/designer';
  const myMobile = `010${Math.floor(Math.random() * 89999999 + 10000000)}`;
  const dto = {
    mobileNumber: myMobile,
    verifyNumber: '123456',
    name: 'Designer Mobile Test',
    email: `designer2${Date.now()}@example.com`,
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
    console.log('DESIGNER CREATE SUCCESS:', res.status);
    
    // Attempt logins
    try {
        const loginRes = await axios.post('http://account.cubric.io/api/designer/login', {
            mobileNumber: myMobile,
            verifyNumber: '123456'
        });
        console.log('DESIGNER LOGIN SUCCESS:', loginRes.status);
    } catch(e: any) {
        console.log('DESIGNER LOGIN FAIL:', e.response?.status, e.response?.data);
    }
  } catch (err: any) {
    console.log('DESIGNER CREATE FAIL:', err.response?.status, err.response?.data);
  }
}
probe();
