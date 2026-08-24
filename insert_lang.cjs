const fs = require('fs');
const file = 'src/components/admin/SiteEditor.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `                  </div>
                </div>
              </div>
            )}

            {activeTab === "hero" && (`;

const insertStr = `                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-brand-primary" /> 다국어 설정
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-xl border">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={draft.nav.languageSettings?.enabled || false}
                            onChange={(e) =>
                              updateNav("languageSettings", {
                                ...(draft.nav.languageSettings || { availableLanguages: ['ko', 'en'] }),
                                enabled: e.target.checked
                              })
                            }
                          />
                          <div className={\`block w-10 h-6 rounded-full transition-colors \${draft.nav.languageSettings?.enabled ? 'bg-brand-primary' : 'bg-gray-300'}\`}></div>
                          <div className={\`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform \${draft.nav.languageSettings?.enabled ? 'transform translate-x-4' : ''}\`}></div>
                        </div>
                        <span className="ml-3 text-sm font-bold text-gray-700">다국어 설정 활성화</span>
                      </label>
                    </div>

                    {draft.nav.languageSettings?.enabled && (
                      <div className="space-y-2 mt-4 pt-4 border-t border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-2">지원 언어 선택</label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { code: 'ko', name: '한국어' },
                            { code: 'en', name: '영어' },
                            { code: 'ja', name: '일어' },
                            { code: 'zh', name: '중국어' },
                            { code: 'es', name: '스페인어' },
                            { code: 'fr', name: '불어' },
                            { code: 'vi', name: '베트남어' },
                            { code: 'th', name: '태국어' },
                          ].map(lang => (
                            <label key={lang.code} className="inline-flex items-center bg-white border px-3 py-1.5 rounded-full cursor-pointer hover:bg-gray-50">
                              <input
                                type="checkbox"
                                className="rounded text-brand-primary focus:ring-brand-primary mr-2"
                                checked={(draft.nav.languageSettings?.availableLanguages || []).includes(lang.code)}
                                onChange={(e) => {
                                  const currentLangs = draft.nav.languageSettings?.availableLanguages || [];
                                  const newLangs = e.target.checked
                                    ? [...currentLangs, lang.code]
                                    : currentLangs.filter(code => code !== lang.code);
                                  
                                  updateNav("languageSettings", {
                                    ...draft.nav.languageSettings,
                                    availableLanguages: newLangs,
                                    enabled: true
                                  });
                                }}
                              />
                              <span className="text-sm text-gray-700 font-medium">{lang.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "hero" && (`;

content = content.replace(targetStr, insertStr);
fs.writeFileSync(file, content);
console.log("Success! Updated SiteEditor.tsx");
