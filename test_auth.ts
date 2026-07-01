import axios from 'axios';
async function test() {
  try {
    const res = await axios.post('http://localhost:3000/api/core/auth/login', {
       email: 'cubric.ceo@gmail.com', password: 'password'
    });
    console.log(res.data);
  } catch(e) {}
}
test();
