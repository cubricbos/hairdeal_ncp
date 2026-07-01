import axios from 'axios';
async function test() {
  const accountUrl = 'http://account.cubric.io/api';
  const id = '277a6532968840169d89501b7bfa1dbd';
  const endpoints = [
    `/admin/designer?designerId=${id}`,
    `/admin/designers?designerId=${id}`,
  ];

  for (const ep of endpoints) {
    try {
      const res = await axios.get(accountUrl + ep);
      console.log('Success:', ep, res.data.career, res.data.introduce);
    } catch(e: any) {
      console.log('Fail:', ep, e.response?.status);
    }
  }
}
test();
