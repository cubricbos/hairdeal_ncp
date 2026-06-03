import axios from 'axios';
async function probe() {
  const url = 'http://account.cubric.io/api/account/login';
  
  // What are the expected fields?
  // Let's create an account first
  const myMobile = `010${Math.floor(Math.random() * 89999999 + 10000000)}`;
  const dto = {
    mobileNumber: myMobile, verifyNumber: '123456', name: 'Login Test',
    email: `dto${Date.now()}@example.com`, gender: 'Female', birthday: '1990-01-01T00:00:00Z',
    signedBy: 'Email', isServiceTermsAgreed: true, isPrivacyPolicyAgreed: true,
    isLocationServiceTermsAgreed: true, isMarketingTermsAgreed: false
  };
  
  try {
     await axios.post('http://account.cubric.io/api/account', dto);
     console.log('Account created for', myMobile);
     
     const payloads = [
        { mobileNumber: myMobile, verifyNumber: '123456' },
        { phoneNumber: myMobile, code: '123456' },
        { id: dto.email, password: 'password' },
        { email: dto.email, verifyNumber: '123456' }
     ];
     for(const p of payloads) {
        try {
           const r = await axios.post(url, p);
           console.log('LOGIN SUCCESS:', p, Object.keys(r.headers));
           break;
        } catch(e:any) {
           console.log('FAIL:', p, e.response?.status);
        }
     }
  } catch(e) {}
}
probe();
