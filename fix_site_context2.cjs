const fs = require('fs');
const file = 'src/context/SiteContext.tsx';
let content = fs.readFileSync(file, 'utf8');

const buggyCode2 = `          if (mergedCache.features) {
             mergedCache.features.items = defaultSiteSettings.features.items;
          }`;

const fixedCode2 = `          if (mergedCache.features && (!mergedCache.features.items || mergedCache.features.items.length === 0)) {
             mergedCache.features.items = defaultSiteSettings.features.items;
          }`;

content = content.replace(buggyCode2, fixedCode2);
fs.writeFileSync(file, content);
console.log('Fixed cache load as well');
