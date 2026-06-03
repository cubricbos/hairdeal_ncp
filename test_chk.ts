import axios from 'axios';
async function test() {
  const accountBase = 'http://localhost:3000/api/account/designer';
  
  console.log("=== Testing Valid Admin Phone ===");
  try {
    const res = await axios.post(`${accountBase}/login`, {
      mobileNumber: '01088889999',
      password: 'wrongpassword'
    });
    console.log('01088889999 (should exist):', res.status, res.data);
  } catch(e: any) {
    console.log('01088889999 failed:', e.response?.status, e.response?.data);
  }

  console.log("\n=== Testing Random Invalid Phone ===");
  try {
    const res = await axios.post(`${accountBase}/login`, {
      mobileNumber: '01000000000',
      password: 'wrongpassword'
    });
    console.log('01000000000 (should NOT exist):', res.status, res.data);
  } catch(e: any) {
    console.log('01000000000 failed:', e.response?.status, e.response?.data);
  }
}
test();
