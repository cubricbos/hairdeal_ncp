import axios from 'axios';

async function probe() {
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
    console.log('CREATE SUCCESS:', res.status);
    const token = res.headers['x-cubric-authorization-token'] || res.headers['access-token'] || res.headers['authorization'];
    console.log('TOKEN:', token);
    
    // Now let's try to fetch detail via account
    const pathsToTry = [
      'http://account.cubric.io/api/account/detail',
      'http://account.cubric.io/api/account',
      'http://account.cubric.io/api/designer/detail'
    ];
    for (const path of pathsToTry) {
        try {
            const detailRes = await axios.get(path, {
                headers: {
                    'x-cubric-authorization-token': token,
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(`DETAIL SUCCESS ${path}:`, detailRes.data);
        } catch (e: any) {
             console.log(`DETAIL FAIL ${path}:`, e.response?.status, e.response?.data);
        }
    }
    
  } catch (err: any) {
    console.log('FAIL:', err.response?.status, err.response?.data);
  }
}
probe();
