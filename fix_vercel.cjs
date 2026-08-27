const fs = require('fs');
const vercelConf = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
vercelConf.rewrites = vercelConf.rewrites.filter(r => r.source !== '/api/admin/:match*');
fs.writeFileSync('vercel.json', JSON.stringify(vercelConf, null, 2));
console.log("Fixed vercel.json");
