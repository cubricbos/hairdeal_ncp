import axios from 'axios';
async function test() {
  console.log("Testing connection to http://43.203.235.158:8080/v3/api-docs with 3s timeout...");
  try {
      const v = await axios.get(`http://43.203.235.158:8080/v3/api-docs`, { timeout: 3000 });
      const paths = Object.keys(v.data.paths);
      console.log('All API Paths available:', paths);
  } catch(e: any) { 
      console.log('Error occurred:', e.message); 
      if (e.response) {
         console.log('Response Status:', e.response.status);
         console.log('Response Data:', JSON.stringify(e.response.data));
      }
  }
}
test();
