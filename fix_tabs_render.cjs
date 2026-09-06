const fs = require('fs');
const file = 'src/pages/admin/ShopManagementPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// The orders tab starts around line 751:
// {activeTab === 'orders' ? (
content = content.replace("{activeTab === 'orders' ? (", "{activeTab === 'orders' && (");

// The else part for settings is currently around line 861:
//           </div>
//         ) : (
//           <>
const elsePattern = `          </div>
        ) : (
          <>`;
const elseReplacement = `          </div>
        )}
        {activeTab === 'settings' && (
          <>`;

content = content.replace(elsePattern, elseReplacement);

fs.writeFileSync(file, content);
console.log("Fixed ternary tab render");
