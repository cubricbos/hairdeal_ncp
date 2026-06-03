import axios from 'axios';
async function probe() {
  const url = 'http://account.cubric.io/api/account/login';
  try {
     const res = await axios.post(url, { mobileNumber: '01011112222', verifyNumber: '123456' }, {
        headers: {
            'Accept': 'application/json'
        },
        validateStatus: () => true
     });
     console.log('STATUS:', res.status);
     console.log('RESONSE DATA:', res.data);
  } catch(e: any) {
     console.log(e);
  }
}
probe();
