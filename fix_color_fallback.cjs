const fs = require('fs');
const file = 'src/components/admin/SiteEditor.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  'value={draft.hero.metricsColor || "#0b0f19"}',
  'value={draft.hero.metricsColor || "#ffffff"}'
);
fs.writeFileSync(file, content);
console.log('Fixed default color picker fallback');
