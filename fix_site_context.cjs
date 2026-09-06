const fs = require('fs');
const file = 'src/context/SiteContext.tsx';
let content = fs.readFileSync(file, 'utf8');

const buggyCode = `           // Force update features
           if (merged.features) {
             merged.features.items = defaultSiteSettings.features.items;
           }`;

const fixedCode = `           // Merge features items safely, defaulting if empty
           if (merged.features && (!merged.features.items || merged.features.items.length === 0)) {
             merged.features.items = defaultSiteSettings.features.items;
           }`;

content = content.replace(buggyCode, fixedCode);

fs.writeFileSync(file, content);
console.log('Fixed SiteContext');
