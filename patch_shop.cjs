const fs = require('fs');
const file = 'src/pages/admin/ShopManagementPage.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  "} // NCP Core server sync: load Live Shop Details",
  "}\n        // UI 즉시 렌더링을 위해 외부 서버(NCP) 호출 전에 Loading을 해제합니다.\n        if (isMounted) {\n          setIsLoading(false);\n        }\n\n        // NCP Core server sync: load Live Shop Details"
);
content = content.replace(
  "        }\n\n        // NCP Core server sync: load Live Shop Details",
  "        }\n        \n        // UI 즉시 렌더링을 위해 외부 서버(NCP) 호출 전에 Loading을 해제합니다.\n        if (isMounted) {\n          setIsLoading(false);\n        }\n\n        // NCP Core server sync: load Live Shop Details"
);
fs.writeFileSync(file, content);
console.log("Patched!");
