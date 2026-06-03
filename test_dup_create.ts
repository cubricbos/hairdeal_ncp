import axios from 'axios';
async function test() {
  const accountBase = 'http://localhost:3000/api/account/designer';
  try {
    const r1 = await axios.post(`${accountBase}`, {
       id: 'test' + Date.now(),
       email: 'test_duplicate_phone@example.com',
       password: 'Password123!',
       name: 'test',
       mobileNumber: '01099999999', // From the valid admin
       role: '디자이너',
       hairShop: { name: 't', address: 'a' }
    });
    console.log('Created user:', r1.status);
  } catch(e: any) {
    console.log('Duplicate Create failed error response:', JSON.stringify(e.response?.data, null, 2));
  }
}
test();
