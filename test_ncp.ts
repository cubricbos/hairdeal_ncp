import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// We need an NCP token.
async function run() {
  const loginRes = await axios.post('http://account.cubric.io/v1/auth/login', {
    email: 'cubric.ceo@gmail.com',
    password: process.env.VITE_TEST_PASSWORD || 'password' // probably won't work, maybe I can just scan the endpoints using swagger API docs?
  }).catch(e => e.response);

  console.log("login:", loginRes?.status, loginRes?.data);
}
run();
