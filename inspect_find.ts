import axios from 'axios';
async function test() {
  try {
    const res = await axios.get('http://localhost:3000/api/account/designer/find/profile?mobileNumber=01012345678');
    console.log('01012345678:', res.status, res.data);
  } catch(e: any) {
    console.log('01012345678 failed:', e.response?.status, e.response?.data);
  }
  
  try {
    const res = await axios.get('http://localhost:3000/api/account/designer/find/profile?mobileNumber=01088889999');
    console.log('01088889999:', res.status, res.data);
  } catch(e: any) {
    console.log('01088889999 failed:', e.response?.status, e.response?.data);
  }
}
test();
