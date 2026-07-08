import fs from 'fs';

const filePath = 'src/pages/AdminPage.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Replace in the second mapping (around line 900)
content = content.replace(
  "ncp_synced: !!(ncpData.email || u.email || ncpData.accountId || u.id), // Custom flag to show if they exist in NCP",
  "ncp_synced: !!(ncpData.email || u.email || ncpData.accountId || u.id),\n            ncp_account_id: ncpData.accountId || u.id,"
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Patched admin mapping 2');
