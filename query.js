import axios from 'axios';
const apiBaseURL = 'http://localhost:3000/api/core';
const apiClient = axios.create({ baseURL: apiBaseURL });
apiClient.get('/admin/designers').then(res => console.log("OK", res.status)).catch(err => console.log("ERR", err.response?.status, err.message));
apiClient.get('/faceswap/models').then(res => console.log("OK", res.status)).catch(err => console.log("ERR", err.response?.status, err.message));
