import axios from 'axios';
async function probe() {
  const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjljYmY3YmQxM2U0ZTRiNzE5MjMzZmRkNmU2MzA4NWQxIiwiaWF0IjoxNzgwMTk1NTYwLCJleHAiOjE3ODAyODE5NjB9.87Ebo8nGgSZEc6RPux1nZO3dtaqO001kERMQCOMHqz8'; // valid test token
  
  try {
      const loginRes = await axios.get('http://hairdeal.cubric.io/api/designer/detail', {
          headers: {
              'x-cubric-authorization-token': token,
              Authorization: `Bearer ${token}`
          }
      });
      console.log('GET SUCCESS:', loginRes.status, loginRes.data);
  } catch(e: any) {
      console.log('GET FAIL:', e.response?.status, e.response?.data);
  }
}
probe();
