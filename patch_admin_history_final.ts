import fs from 'fs';

const filePath = 'src/pages/AdminPage.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Also update it for the detailed modal view (which uses profileId)
content = content.replace(
  "const targetDesignerId = profile.ncp_account_id || profile.ncp_designer_id || profileId;",
  "const targetDesignerId = profile.ncp_account_id || profile.accountId || profile.ncp_designer_id || profileId;"
);

content = content.replace(
  "const targetDesignerId = profileInfo?.ncp_account_id || profileInfo?.ncp_designer_id || userId;",
  "const targetDesignerId = profileInfo?.ncp_account_id || profileInfo?.accountId || profileInfo?.ncp_designer_id || userId;"
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Patched admin history final');
