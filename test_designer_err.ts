import axios from 'axios';
async function test() {
  try {
    const res = await axios.post('http://localhost:3000/api/account/designer', {
    });
  } catch(e: any) {
    if (e.response && e.response.data) {
       console.log('Error data:', JSON.stringify(e.response.data, null, 2));
    }
  }
}
test();
