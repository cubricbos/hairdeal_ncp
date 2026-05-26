import fs from 'fs';
const path = 'src/pages/AdminPage.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix syntax error (duplicate block)
const searchStr = '         } else {\n            console.error("Error fetching profiles:", usersError);\n            setTotalUsers(1248); // Fallback dummy if table doesn\'t exist yet\n         }\n            console.error("Error fetching profiles:", usersError);\n            setTotalUsers(1248); // Fallback dummy if table doesn\'t exist yet\n         }';

// Since we suspect tabs, let's try to be smarter. 
// We'll replace the block from line 238 to 244 by matching a regex if possible or just slicing.
const lines = content.split('\n');
// Let's find the lines
let startIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('console.error("Error fetching profiles:", usersError);')) {
    if (startIdx === -1) {
      startIdx = i; // Line 239 (0-indexed 238)
    } else {
      // Second occurrence found around 242.
      // We want to delete the second occurrence and the closing brace before it and after it.
      // Actually line 241 is the closing brace of the FIRST else. 
      // 242 is console.error. 243 is setTotalUsers. 244 is closing brace.
      // So we delete lines i, i+1, i+2 (where i is 242-1 = 241)
      if (i > startIdx + 1) {
         lines.splice(i, 3); 
         break;
      }
    }
  }
}

content = lines.join('\n');

// Replace Sync button with Refresh button
const syncSearch = '                        if (!window.confirm("모든 사용자의 크레딧을 이용내익(credit_transactions)을 기준으로 재계산하여 동기화하시겠습니까? (이 작업은 되돌릴 수 없습니다.)")) return;';
// Wait, the spelling might be different (이용내역 vs 이용내익). Checking previous view.
// Previous view had: if (!window.confirm("모든 사용자의 크레딧을 이용내역(credit_transactions)을 기준으로 재계산하여 동기화하시겠습니까? (이 작업은 되돌릴 수 없습니다.)")) return;

const newRefreshLogic = `                        setIsLoading(true);
                        try {
                           const { data: usersData, error: usersError } = await supabase
                             .from('profiles')
                             .select('*')
                             .order('created_at', { ascending: false });
                           
                           if (!usersError && usersData) {
                              const usersWithCredits = usersData.map((u: any) => ({ 
                                ...u, 
                                credits: Number(u.credits || 0) 
                              }));
                              setProfiles(usersWithCredits);
                              setTotalUsers(usersWithCredits.length);
                              alert('사용자 목록이 새로고침되었습니다.');
                           }
                        } catch (err) {
                           console.error(err);
                        } finally {
                           setIsLoading(false);
                        }`;

// We will do a simpler replacement of the button content
content = content.replace(/<button\s+onClick=\{async \(\) => \{\s+if \(!window\.confirm\("모든 사용자의 크레딧을 이용내역.*?<\/button>/s, 
`<button 
                      onClick={async () => {
                        ${newRefreshLogic}
                      }}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-2"
                    >
                      <Activity className="w-4 h-4" />
                      목록 새로고침
                    </button>`);

fs.writeFileSync(path, content);
console.log('Fixed AdminPage.tsx');
