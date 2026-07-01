import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf-8');

// Replace the POST /api/account/hair-shop logic inside
content = content.replace(
  /const allData = loadStoreData\(\);\s*allData\[designerId\] = \{[\s\S]*?saveStoreData\(allData\);\s*console\.log\(`\[PROXY BYPASS SAVE - Account\] Captured local-stub for designer \$\{designerId\}`\);/g,
  `// Removed local spoof storage, directly forwarding to real servers below (not implemented for account-side explicitly if it proxies naturally, but left stub response in place if needed).`
);

fs.writeFileSync('server.ts', content, 'utf-8');
console.log("Rewritten!");
