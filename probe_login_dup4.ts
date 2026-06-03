import axios from 'axios';
async function probe() {
  const url = 'http://account.cubric.io/api/account/login';
  const myMobile = `010${Math.floor(Math.random() * 99999 + 10000)}0`;
  const email = `dto${Date.now()}@example.com`;
  
  try {
     // Create
     await axios.post('http://account.cubric.io/api/account', {
        mobileNumber: myMobile, verifyNumber: '123456', name: 'Test', email,
        gender: 'Female', birthday: '1990-01-01T00:00:00Z', signedBy: 'Email', socialLoginId: null, isServiceTermsAgreed: true,
        isPrivacyPolicyAgreed: true, isLocationServiceTermsAgreed: true, isMarketingTermsAgreed: false
     });
     
     // Try login with accountId
     const r = await axios.post(url, { accountId: email, password: 'password' });
     console.log('LOGIN SUCCESS', Object.keys(r.headers));
  } catch(e:any) {
     console.log('FAIL:', e.response?.status, e.response?.data);
  }
}
probe();
