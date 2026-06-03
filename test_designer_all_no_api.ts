import axios from 'axios';

async function testAllNoApi() {
  const url = 'http://account.cubric.io/designer/all';
  try {
    const res = await axios.get(url);
    console.log('Success:', res.status);
    console.log('Sample user:', JSON.stringify(res.data[0], null, 2));
  } catch (err) {
    console.error('Fail:', err.message);
  }
}

testAllNoApi();
