const fs = require('fs');
const file = 'server.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  "const admin = getSupabaseAdmin();\n      if (!admin) {\n        return res.status(500).json({ error: 'Supabase admin client not available' });\n      }",
  "const admin = getSupabaseAdmin() || supabase;\n      if (!admin) {\n        return res.status(500).json({ error: 'Supabase admin client not available' });\n      }"
);
content = content.replace(
  "const admin = getSupabaseAdmin();\n      if (!admin) {\n        return res.status(500).json({ error: 'Supabase admin client not available' });\n      }",
  "const admin = getSupabaseAdmin() || supabase;\n      if (!admin) {\n        return res.status(500).json({ error: 'Supabase admin client not available' });\n      }"
);
fs.writeFileSync(file, content);
console.log('Fixed visitor logs proxy');
