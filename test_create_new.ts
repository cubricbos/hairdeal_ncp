import axios from 'axios';
async function test() {
  const accountBase = 'http://localhost:3000/api/account/designer';
  
  try {
    const r1 = await axios.post(`${accountBase}`, {
       id: 'test' + Date.now(),
       email: `test_${Date.now()}@example.com`,
       password: 'Password123!',
       name: 'test',
       mobileNumber: '01011112222', // NEW number
       role: '디자이너',
       hairShop: { name: 't', address: 'a' }
    });
    console.log('Created NEW user:', r1.status);
  } catch(e: any) {
    console.log('NEW Create failed:', JSON.stringify(e.response?.data, null, 2));
  }
}
test();
