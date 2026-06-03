console.log(Object.keys(process.env).filter(k => 
  k.includes('DB') || k.includes('DATABASE') || k.includes('POSTGRES') || k.includes('URL') || k.includes('CONN')
));
console.log('ACCOUNT_SERVER_URL:', process.env.ACCOUNT_SERVER_URL);
console.log('CORE_SERVER_URL:', process.env.CORE_SERVER_URL);
