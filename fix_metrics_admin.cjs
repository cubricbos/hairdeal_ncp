const fs = require('fs');
const file = 'server.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  /const admin = getSupabaseAdmin\(\);\s+if \(!admin\) return res\.status\(500\)\.json\(\{ error: 'No admin client' \}\);/g,
  "const admin = getSupabaseAdmin() || supabase;\n      if (!admin) return res.status(500).json({ error: 'No admin client' });"
);
fs.writeFileSync(file, content);
console.log('Fixed metrics admin');
