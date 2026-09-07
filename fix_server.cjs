const fs = require('fs');
const file = 'server.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace('const client = getSupabaseAdmin() || supabase;', 'const client = getSupabaseAdmin();');
fs.writeFileSync(file, content);
