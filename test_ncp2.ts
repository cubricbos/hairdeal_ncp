import axios from 'axios';

async function test() {
  const accountBase = 'http://localhost:3000/api/account/designer';

  let hexId = '';
  for(let i=0; i<32; i++) hexId += Math.floor(Math.random()*16).toString(16);

  try {
    const r1 = await axios.post(`${accountBase}`, {
       id: hexId,
       email: `test_${Date.now()}@test.com`,
       password: 'Password123!',
       name: '테스터',
       mobileNumber: `010${Math.floor(Math.random()*100000000)}`,
       role: '디자이너'
    });
    console.log('Created user:', r1.status);
  } catch(e: any) {
    console.log('Create failed:', e.response?.status, e.response?.data);
  }
}
test();
