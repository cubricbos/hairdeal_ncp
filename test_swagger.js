import axios from 'axios';

async function fetchDocs() {
  try {
    const res = await axios.get('http://49.50.133.211:8081/v3/api-docs');
    const paths = Object.keys(res.data.paths);
    console.log('Account Base API Paths:', paths);
  } catch (e) {
    console.log('Error fetching account docs:', e.message);
  }

  try {
    const res = await axios.get('http://49.50.133.211:8083/v3/api-docs');
    const paths = Object.keys(res.data.paths);
    console.log('Core Base API Paths:', paths);
  } catch (e) {
    console.log('Error fetching core docs:', e.message);
  }
}

fetchDocs();
