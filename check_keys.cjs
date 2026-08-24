require('dotenv').config();
console.log("Env keys available:", Object.keys(process.env).filter(k => k.includes('SUPABASE')));
