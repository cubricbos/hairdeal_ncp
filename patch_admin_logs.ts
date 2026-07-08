import fs from 'fs';

const filePath = 'src/pages/AdminPage.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace(
  'console.warn("NCP Admin history fetch failed, falling back to Supabase.");',
  'console.warn("NCP Admin history fetch failed, falling back to Supabase.", e);'
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Patched admin logs');
