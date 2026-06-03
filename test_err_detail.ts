import axios from 'axios';
async function test() {
  try {
    const res = await axios.post('http://localhost:3000/api/account/designer', {
       name: '테스터'
    });
  } catch(e: any) {
    console.log(e.response?.data);
  }
}
test();
