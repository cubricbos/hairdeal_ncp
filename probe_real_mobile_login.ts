import axios from 'axios';
async function run() {
  const accountBase = 'http://account.cubric.io/api';
  const phone = '01012345678';
  try {
    const signup = await axios.post(`${accountBase}/designer`, {
        mobileNumber: phone, verifyNumber: '111111',
        name: 'Login Test', email: `logintest_${Date.now()}@test.com`,
        gender: 'Male', birthday: '2000-01-01T00:00:00Z',
        isServiceTermsAgreed: true, isPrivacyPolicyAgreed: true, isLocationServiceTermsAgreed: true, isMarketingTermsAgreed: false
    });
    console.log(`Signup success:`, signup.status);
  } catch (e: any) {
    console.log(`Signup fail:`, e?.response?.status);
  }

  try {
    const login = await axios.post(`${accountBase}/designer/login`, {
        mobileNumber: phone, verifyNumber: '111111'
    });
    console.log(`Login success:`, login.status);
  } catch (e: any) {
    console.log(`Login fail:`, e?.response?.status, e?.response?.data);
  }
}
run();
