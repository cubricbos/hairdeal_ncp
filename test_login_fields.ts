import axios from 'axios';

async function run() {
  const directURL = 'http://account.cubric.io/api/designer/login';

  const inputs = [
    {
      title: "username + Password123!",
      body: { username: 'dltpwlswkdf@gmail.com', password: 'Password123!' }
    },
    {
      title: "email + Password123!",
      body: { email: 'dltpwlswkdf@gmail.com', password: 'Password123!' }
    },
    {
      title: "accountId + Password123!",
      body: { accountId: 'dltpwlswkdf@gmail.com', password: 'Password123!' }
    },
    {
      title: "id + Password123!",
      body: { id: 'dltpwlswkdf@gmail.com', password: 'Password123!' }
    },
    {
      title: "mobileNumber + Password123!",
      body: { mobileNumber: '01055240911', password: 'Password123!' }
    }
  ];

  for (const item of inputs) {
    try {
      console.log(`Testing login field structure: ${item.title}`);
      const res = await axios.post(directURL, item.body);
      console.log(' -> SUCCESS:', res.status, res.data);
    } catch(e: any) {
      console.log(' -> FAIL STATUS:', e.response?.status, JSON.stringify(e.response?.data));
    }
  }
}

run();
