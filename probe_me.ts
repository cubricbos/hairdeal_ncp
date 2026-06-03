import axios from 'axios';

async function probe() {
  const url = 'http://account.cubric.io/api/account';
  const dto = {
    mobileNumber: `010${Math.floor(Math.random() * 89999999 + 10000000)}`,
    verifyNumber: '123456',
    name: 'Me Test',
    email: `metest${Date.now()}@example.com`,
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
    const token = res.headers['x-cubric-authorization-token'];
    
    const pathsToTry = [
      'http://account.cubric.io/api/account/me',
      'http://account.cubric.io/api/account/profile',
      'http://account.cubric.io/api/account/info',
      'http://account.cubric.io/api/account/user'
    ];
    for (const p of pathsToTry) {
        try {
            const detailRes = await axios.get(p, {
                headers: {
                    'x-cubric-authorization-token': token,
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(`ME SUCCESS ${p}:`, detailRes.data);
        } catch (e: any) {
            console.log(`ME FAIL ${p}:`, e.response?.status, e.response?.data);
        }
    }
  } catch (err: any) {
    console.log('FAIL:', err.response?.status, err.response?.data);
  }
}
probe();
