import axios from 'axios';

async function test() {
  const accountUrl = 'http://account.cubric.io/api';
  const id = 'd2c289a28d76425894adaec4d9e9820a';
  const endpoints = [
    `/admin/designer/${id}`,
    `/admin/designer?designerId=${id}`,
    `/admin/designers/${id}`,
    `/designer/${id}`,
    `/designer?designerId=${id}`
  ];

  for (const ep of endpoints) {
    try {
      const res = await axios.get(accountUrl + ep);
      console.log('Success:', ep, Object.keys(res.data), res.data.career || res.data.careerYears, res.data.introduce || res.data.introduction);
    } catch(e: any) {
      console.log('Fail:', ep, e.response?.status);
    }
  }
}
test();
