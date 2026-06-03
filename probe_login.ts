import axios from 'axios';

async function probeLogin() {
  const accountUrl = 'http://account.cubric.io/api/account/login';
  const urls = [
      'http://account.cubric.io/api/account/login',
      'http://account.cubric.io/api/auth/login',
      'http://account.cubric.io/api/login',
      'http://account.cubric.io/api/account/sign-in',
      'http://account.cubric.io/api/sign-in'
  ];

  // Try logging in with the user we just created. The password in the backend is auto-generated as email&mobileNumber, but usually login dto only takes what the user provides.
  // Wait, if it's mobile verification login, it probably takes mobileNumber and verifyNumber?
  // Let's try sending just mobileNumber, or mobileNumber and verifyNumber. Wait, the user said "ncp는 비밀번호가 없고 휴대폰 인증 방식이라" - so login requires SMS verification again!
  const dto1 = { mobileNumber: '01011112222', verifyNumber: '123456' };
  const dto2 = { email: 'jejjdawn@gmail.com', mobileNumber: '01011112222' };

  for (const url of urls) {
      try {
        console.log('Testing URL:', url, 'with dto1');
        const res = await axios.post(url, dto1);
        console.log('SUCCESS:', url, res.status);
        console.log('DATA:', res.data);
        return;
      } catch (err: any) {
        console.log('FAIL:', url, err.response?.status, err.response?.data);
      }
      try {
        console.log('Testing URL:', url, 'with dto2');
        const res = await axios.post(url, dto2);
        console.log('SUCCESS:', url, res.status);
        console.log('DATA:', res.data);
        return;
      } catch (err: any) {
        console.log('FAIL dto2:', url, err.response?.status, err.response?.data);
      }
  }
}

probeLogin();
