import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf-8');

// Completely remove the app.post('/api/account/hair-shop') manual interceptor
content = content.replace(
  /\/\/ 2\. Intercept legacy account hairshop save & forward to real server[\s\S]*?app\.use\('\/api\/account/m,
  "app.use('/api/account"
);

fs.writeFileSync('server.ts', content, 'utf-8');
console.log("Patched server.ts successfully");
