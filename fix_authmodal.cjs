const fs = require('fs');
let content = fs.readFileSync('src/components/AuthModal.tsx', 'utf8');
const target = `const base64Payload = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));`;
const replacement = `const base64Payload = btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
            .replace(/=/g, '')
            .replace(/\\+/g, '-')
            .replace(/\\//g, '_');`;
content = content.replace(target, replacement);
fs.writeFileSync('src/components/AuthModal.tsx', content);
console.log("Fixed AuthModal.tsx");
