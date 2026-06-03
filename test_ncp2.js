import axios from 'axios';

async function test() {
  const accountBaseURL = process.env.VITE_NCP_ACCOUNT_URL || 'http://49.50.133.211:8081';

  try {
    const res1 = await axios.get(`${accountBaseURL}/admin/desginers`); // maybe a typo in API? Let's check Swagger or options
    console.log('/admin/desginers:', res1.data);
  } catch (e) {
    console.log('/admin/desginers failed:', e.message);
  }

  try {
    const res2 = await axios.get(`${accountBaseURL}/admin/designer`); 
    console.log('/admin/designer:', res2.data);
  } catch (e) {
    console.log('/admin/designer failed:', e.message);
  }

  try {
    const res3 = await axios.get(`${accountBaseURL}/admin/user`); 
    console.log('/admin/user:', res3.data);
  } catch (e) {
    console.log('/admin/user failed:', e.message);
  }
}

test();
