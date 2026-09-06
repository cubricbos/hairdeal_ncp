const fs = require('fs');
const file = 'src/context/SiteContext.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace('if (data && !error) { {', 'if (data && !error) {');
fs.writeFileSync(file, content);
