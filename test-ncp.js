const axios = require('axios');
const payload = {
  "mobileNumber": "01049990044",
  "verifyNumber": "123456",
  "name": "cubric",
  "email": "cubric@kakao.com",
  "gender": "Female",
  "birthday": "1990-01-01T00:00:00Z",
  "signedBy": "Kakao",
  "socialLoginId": "3783782470",
  "isServiceTermsAgreed": true,
  "isPrivacyPolicyAgreed": true,
  "isLocationServiceTermsAgreed": true,
  "isMarketingTermsAgreed": false,
  "referralCode": null
};

axios.post('http://account.cubric.io/api/designer', payload)
  .then(res => console.log('Success:', res.status, res.data))
  .catch(err => {
    console.error('Error:', err.response?.status, err.response?.data);
  });
