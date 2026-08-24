const fs = require('fs');
const file = 'src/components/admin/SiteEditor.tsx';
let content = fs.readFileSync(file, 'utf8');

// The block to extract
const blockStartStr = `                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-brand-primary" /> 다국어 설정
                  </h3>`;
const blockEndStr = `                  </div>
                </div>`;

const blockStartIndex = content.indexOf(blockStartStr);
if (blockStartIndex !== -1) {
  const blockEndIndex = content.indexOf(blockEndStr, blockStartIndex) + blockEndStr.length;
  const blockContent = content.substring(blockStartIndex, blockEndIndex);
  
  // Remove it from current location
  content = content.substring(0, blockStartIndex) + content.substring(blockEndIndex);
  
  // Insert it at the top of activeTab === "nav"
  const navTabStr = `{activeTab === "nav" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">`;
  const navTabIndex = content.indexOf(navTabStr);
  
  if (navTabIndex !== -1) {
    const insertPos = navTabIndex + navTabStr.length;
    content = content.substring(0, insertPos) + '\n' + blockContent + '\n' + content.substring(insertPos);
    fs.writeFileSync(file, content);
    console.log("Moved language settings to top of nav tab.");
  } else {
    console.log("Failed to find nav tab start.");
  }
} else {
  console.log("Failed to find language settings block.");
}
