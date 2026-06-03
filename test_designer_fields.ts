import axios from 'axios';
async function test() {
  const url = 'http://localhost:3000/api/account/designer';
  const base = {
    email: 'test_12345@ex.com',
    password: 'Password123!',
    name: '테스터'
  };

  const probes = [
    { ...base, mobileNumber: '01011112222' },
    { ...base, phoneNumber: '01011112222' },
    { ...base, phone: '01011112222' },
    { ...base, mobileNumber: '010-1111-2222' },
    { ...base, id: 'test_ds1', mobileNumber: '01011112222' },
    { email: 'tt@ex.com', password: 'abc', name: 'tt', phone: '01011112222', storeId: 1 },
    { email: 'tt@ex.com', password: 'abc', name: 'tt', mobileNumber: '01011112222', status: 'ACTIVE' },
    { accountId: 'tt@ex.com', password: 'abc', name: 'tt', mobileNumber: '01011112222' },
    { username: 'tt@ex.com', password: 'abc', name: 'tt', mobileNumber: '01011112222' }
  ];

  for (const p of probes) {
    try {
      const { status, data } = await axios.post(url, p);
      console.log('SUCCESS!', p, status, data);
    } catch(e: any) {
      console.log('FAIL:', p, e.response?.status, typeof e.response?.data === 'object' ? JSON.stringify(e.response?.data) : e.response?.data);
    }
  }
}
test();
