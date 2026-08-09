const fs = require('fs');
const file = 'src/components/admin/SiteEditor.tsx';
let content = fs.readFileSync(file, 'utf8');

const insertionPoint = '                  {draft.nav.logoType === "image" && (';

const snippet = `                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        주요 버튼 텍스트 (예: 무료 시작하기)
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-brand-primary"
                        placeholder="무료 시작하기"
                        value={draft.nav.primaryBtnText || '무료 시작하기'}
                        onChange={(e) => updateNav("primaryBtnText", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        버튼 동작
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          className="flex-1 border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-brand-primary"
                          value={draft.nav.primaryBtnAction || 'modal'}
                          onChange={(e) => updateNav("primaryBtnAction", e.target.value)}
                        >
                          <option value="section"># 타겟 이동</option>
                          <option value="link">외부 링크 이동</option>
                          <option value="modal">모달 띄우기</option>
                        </select>
                        <select
                          className="flex-1 border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-brand-primary"
                          value={draft.nav.primaryBtnTarget || (draft.nav.primaryBtnAction === 'modal' ? 'auth' : '')}
                          onChange={(e) => updateNav("primaryBtnTarget", e.target.value)}
                          style={{ display: draft.nav.primaryBtnAction === 'modal' ? 'block' : 'none' }}
                        >
                          <option value="auth">로그인 모달</option>
                          <option value="inquiry">문의하기 모달</option>
                        </select>
                        <input
                          type="text"
                          className="flex-1 border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-brand-primary"
                          placeholder={draft.nav.primaryBtnAction === 'section' ? "target-id" : "https://..."}
                          value={draft.nav.primaryBtnTarget || ''}
                          onChange={(e) => updateNav("primaryBtnTarget", e.target.value)}
                          style={{ display: draft.nav.primaryBtnAction !== 'modal' ? 'block' : 'none' }}
                        />
                      </div>
                    </div>
                  </div>
`;

if (content.includes(insertionPoint)) {
  content = content.replace(insertionPoint, snippet + '\n' + insertionPoint);
  fs.writeFileSync(file, content);
  console.log("Patched successfully");
} else {
  console.log("Could not find insertion point");
}
