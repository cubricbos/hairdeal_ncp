import fs from 'fs';

const filePath = 'src/pages/AdminPage.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const scrollOld = '<div className="flex-1 overflow-y-auto p-8 flex flex-col">';
const scrollNew = `<div 
                className="flex-1 overflow-y-auto p-8 flex flex-col"
                onScroll={(e) => {
                  const target = e.target as HTMLDivElement;
                  if (target.scrollHeight - target.scrollTop <= target.clientHeight + 100) {
                    loadMoreUserHistory();
                  }
                }}
              >`;

content = content.replace(scrollOld, scrollNew);
fs.writeFileSync(filePath, content, 'utf-8');
console.log('Patched onScroll');
