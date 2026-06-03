console.log(Object.keys(process.env).filter(k => !k.includes('SECRET') && !k.includes('PASSWORD') && !k.includes('KEY')));
