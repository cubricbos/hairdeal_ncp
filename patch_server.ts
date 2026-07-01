import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf-8');

content = content.replace(
  /\/\/ 3\. Intercept and merge custom saved values into GET \/api\/core\/admin\/designer[\s\S]*?\/\/ 4\. Intercept and merge/m,
  "// 4. Intercept and merge"
);

content = content.replace(
  /\/\/ 4\. Intercept and merge custom saved values into GET \/api\/account\/designer\/detail[\s\S]*?app\.use\('\/api\/account',/m,
  "app.use('/api/account',"
);

// We need to keep // 1 because it's required for some custom merging logic if the frontend sends partial businessTimes.
// Wait, the user said changes made in App are NOT visible in Web.
// If the App saves to NCP DB, why doesn't Web see it? 
// Because Web fetches using GET `/api/account/designer/detail`!
// And previously, GET `/api/account/designer/detail` was intercepted.
fs.writeFileSync('server.ts', content, 'utf-8');
console.log("Patched server.ts successfully");
