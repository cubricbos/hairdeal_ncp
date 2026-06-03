import dotenv from 'dotenv';
dotenv.config();

console.log('VITE_TEST_ACCOUNT:', process.env.VITE_TEST_ACCOUNT);
console.log('VITE_TEST_PASSWORD:', process.env.VITE_TEST_PASSWORD);
console.log('ACCOUNT_SERVER_URL:', process.env.ACCOUNT_SERVER_URL);
console.log('CORE_SERVER_URL:', process.env.CORE_SERVER_URL);
console.log('ALL KEYS OF PROCESS.ENV:', Object.keys(process.env).sort());
