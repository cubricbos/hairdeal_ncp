import axios from 'axios';
axios.get('http://localhost:3000/api/core/admin/designer?designerId=123').then(res => console.log("OK", res.status)).catch(e => console.log("ERR", e.response?.status));
axios.get('http://localhost:3000/api/core/admin/designers?page=0&size=1000').then(res => console.log("OK", res.status)).catch(e => console.log("ERR", e.response?.status));
axios.get('http://localhost:3000/api/core/faceswap/models').then(res => console.log("OK", res.status)).catch(e => console.log("ERR", e.response?.status));
