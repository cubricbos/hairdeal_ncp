import axios from 'axios';
async function probe() {
  const url = 'http://account.cubric.io/api/account';
  const myMobile = `010${Math.floor(Math.random() * 99999 + 10000)}0`;
  const email = `dto${Date.now()}@example.com`;
  const name = 'Login Test Account';
  const dto = {
    mobileNumber: myMobile, verifyNumber: '123456', name, email,
    gender: 'Female', birthday: '1990-01-01T00:00:00Z',
    signedBy: 'Email', socialLoginId: null, isServiceTermsAgreed: true,
    isPrivacyPolicyAgreed: true, isLocationServiceTermsAgreed: true, isMarketingTermsAgreed: false, referralCode: null
  };
  try {
    const r1 = await axios.post(url, dto);
    
    // Now post again with IDENTICAL payload
    const r2 = await axios.post(url, dto);
    
    // Now check if it's the same token / ID
    function parseJwt (token) {
        return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    }
    const token1 = r1.headers['x-cubric-authorization-token'];
    const token2 = r2.headers['x-cubric-authorization-token'];
    
    console.log('ID1:', parseJwt(token1).id);
    console.log('ID2:', parseJwt(token2).id);
    console.log('Are IDs same?:', parseJwt(token1).id === parseJwt(token2).id);
    
  } catch (err: any) {}
}
probe();
