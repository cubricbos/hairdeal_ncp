import axios from 'axios';

async function test() {
  try {
    const res = await axios.get('http://49.50.133.211:8081/v3/api-docs', { timeout: 3000 });
    console.log(Object.keys(res.data.paths));
  } catch(e) {
    console.log('Error docs:', e.message);
  }
}
test();
