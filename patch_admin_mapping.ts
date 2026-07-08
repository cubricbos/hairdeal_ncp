import fs from 'fs';

const filePath = 'src/pages/AdminPage.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace(
  "id: designer.id || designer.accountId || designer.designerId,",
  "id: designer.id || designer.accountId || designer.designerId,\n            ncp_account_id: designer.accountId || designer.id,"
);

content = content.replace(
  "const targetDesignerId = profileInfo?.ncp_designer_id || userId;",
  "const targetDesignerId = profileInfo?.ncp_account_id || profileInfo?.ncp_designer_id || userId;"
);

content = content.replace(
  "const targetDesignerId = profile.ncp_designer_id || profileId;",
  "const targetDesignerId = profile.ncp_account_id || profile.ncp_designer_id || profileId;"
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Patched admin mapping');
