import axios from 'axios';
async function test() {
  try {
    const res = await axios.post('http://localhost:3000/api/account/designer', {});
  } catch(e: any) {
    if (e.response) {
       console.log('Error 400 payload:', JSON.stringify(e.response.data, null, 2));
    }
  }
}
test();
