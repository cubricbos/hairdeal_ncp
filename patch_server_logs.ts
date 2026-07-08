import fs from 'fs';

const filePath = 'server.ts';
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace(
  "app.get('/api/admin/user-credit-history', async (req, res) => {",
  "app.get('/api/admin/user-credit-history', async (req, res) => {\n    console.log('[API] /api/admin/user-credit-history hit with query:', req.query);"
);

content = content.replace(
  "return res.json(ncpRes.data);",
  "console.log('[API] NCP returned:', JSON.stringify(ncpRes.data).substring(0, 100));\n      return res.json(ncpRes.data);"
);

content = content.replace(
  "console.warn(\"NCP Admin history fetch failed, falling back to Supabase.\");",
  "console.warn(\"NCP Admin history fetch failed, falling back to Supabase.\", e);"
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Patched logs');
