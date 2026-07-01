import fs from 'fs';
import path from 'path';

let content = fs.readFileSync('server.ts', 'utf-8');

// Replace the GET /api/core/admin/designer proxy merge logic completely
content = content.replace(
  /const allData = loadStoreData\(\);\s*const custom = allData\[designerId\];\s*if \(custom && data\) \{[\s\S]*?\s*\}\s*return res\.json\(data\);/s,
  `return res.json(data);`
);

// Replace the fallback inside GET /api/core/admin/designer
content = content.replace(
  /const allData = loadStoreData\(\);\s*const custom = allData\[designerId\];\s*if \(custom\) \{[\s\S]*?\}\s*next\(\);/s,
  `next();`
);

// Replace the GET /api/core/designer/detail proxy merge logic completely
content = content.replace(
  /const allData = loadStoreData\(\);\s*const custom = allData\[designerId\];\s*if \(custom && data\) \{[\s\S]*?\s*\}\s*return res\.json\(data\);/s,
  `return res.json(data);`
);

// Replace the fallback inside GET /api/core/designer/detail
content = content.replace(
  /const allData = loadStoreData\(\);\s*const custom = allData\[designerId\];\s*if \(custom\) \{[\s\S]*?\}\s*next\(\);/s,
  `next();`
);


// Replace the POST logic save logic
content = content.replace(
  /const allData = loadStoreData\(\);\s*allData\[designerId\] = \{[\s\S]*?saveStoreData\(allData\);\s*console\.log\(`\[PROXY BYPASS SAVE\] Captured local-stub for designer \$\{designerId\}`\);/g,
  `// Removed local spoof storage, directly forwarding to real servers below.`
);

fs.writeFileSync('server.ts', content, 'utf-8');
console.log("Rewritten!");
