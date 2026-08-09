import axios from 'axios';
const accountClient = axios.create({ baseURL: 'http://localhost:3000/api/account' });
accountClient.get('/designer/all').then(res => console.log("OK", res.status)).catch(err => console.log("ERR", err.response?.status, err.message));
