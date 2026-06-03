import axios from 'axios';
async function run() {
  try {
     const id = 'd4ca97ea217b4dc48a5cd8abc2938934';
     const res = await axios.get('http://localhost:3000/api/core/admin/designer', {
       params: { designerId: id }
     });
     console.log('--- Designer Detail JSON (Recently Registered) ---');
     console.log(JSON.stringify(res.data, null, 2));
  } catch(e: any) {
     console.log('Error:', e.message, e.response?.data);
  }
}
run();
