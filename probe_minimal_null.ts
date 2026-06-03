import axios from 'axios';
async function probe() {
  const url = 'http://account.cubric.io/api/account';
  const myMobile = `010${Math.floor(Math.random() * 89999999 + 10000000)}`;
  try {
    const minDto = {
        mobileNumber: myMobile,
        verifyNumber: '123456',
        name: null,
        email: null,
        gender: null,
        birthday: null,
        signedBy: null,
        socialLoginId: null,
        isServiceTermsAgreed: true,
        isPrivacyPolicyAgreed: true,
        isLocationServiceTermsAgreed: true,
        isMarketingTermsAgreed: false,
        referralCode: null
    };
    const res2 = await axios.post(url, minDto);
    console.log('MINIMAL UPSERT SUCCESS:', res2.status, res2.headers['x-cubric-authorization-token']);
  } catch (err: any) {
    console.log('FAIL:', err.response?.status, err.response?.data);
  }
}
probe();
