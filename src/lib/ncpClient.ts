import axios, { AxiosInstance } from 'axios';

// 환경 변수 설정. Proxy 통신을 위해 /api/account로 요청합니다.
const accountBaseURL = '/api/account';
const apiBaseURL = '/api/core';

export const accountClient = axios.create({
  baseURL: accountBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiClient = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const applyTokenInterceptors = (client: AxiosInstance) => {
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('ncp_access_token');
      if (token) {
        if (!config.headers) {
          config.headers = {} as any;
        }
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => {
      const token = response.headers['authorization'] || response.headers['Authorization'] || response.headers['access-token'];
      if (token) {
        const parsedToken = token.startsWith('Bearer ') ? token.slice(7) : token;
        localStorage.setItem('ncp_access_token', parsedToken);
      }
      const refreshToken = response.headers['refresh-token'];
      if (refreshToken) {
        localStorage.setItem('ncp_refresh_token', refreshToken);
      }
      return response;
    },
    (error) => Promise.reject(error)
  );
};

applyTokenInterceptors(accountClient);
applyTokenInterceptors(apiClient);
