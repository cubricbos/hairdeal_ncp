import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Aggressive logout cleanup if requested via URL
const params = new URLSearchParams(window.location.search);
if (params.get('logout')) {
  localStorage.clear();
  sessionStorage.clear();
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
  console.log("Aggressive logout cleanup performed from main.tsx.");
}

// Suppress known Vite HMR Websocket errors in the sandbox environment
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  if (args[0]) {
    const errorStr = typeof args[0] === 'string' ? args[0] : (args[0].message || '');
    if (errorStr.includes('failed to connect to websocket') || 
        errorStr.includes('Invalid Refresh Token: Refresh Token Not Found') ||
        errorStr.includes('Refresh Token Not Found')) {
      return;
    }
  }
  originalConsoleError.apply(console, args);
};

console.warn = (...args) => {
  if (args[0]) {
    const errorStr = typeof args[0] === 'string' ? args[0] : (args[0].message || '');
    if (errorStr.includes('Invalid Refresh Token: Refresh Token Not Found') ||
        errorStr.includes('Refresh Token Not Found')) {
      return;
    }
  }
  originalConsoleWarn.apply(console, args);
};

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message) {
    if (event.reason.message.includes('WebSocket closed without opened') ||
        event.reason.message.includes('Invalid Refresh Token') ||
        event.reason.message.includes('Refresh Token Not Found')) {
      event.preventDefault();
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
