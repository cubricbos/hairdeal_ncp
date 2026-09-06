const fs = require('fs');
const file = 'src/pages/admin/ShopManagementPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add 'qr' to activeTab state
content = content.replace(
  "const [activeTab, setActiveTab] = useState<'settings' | 'orders'>('settings');",
  "const [activeTab, setActiveTab] = useState<'settings' | 'orders' | 'qr'>('settings');"
);

// 2. Add QR Tab button
const oldTabs = `        <div className="flex space-x-1 bg-gray-200 p-1 rounded-xl">
          <button
            className={\`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors \${activeTab === 'settings' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'}\`}
            onClick={() => setActiveTab('settings')}
          >
            QR 호출 서비스 및 메뉴 설정
          </button>
          <button
            className={\`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-colors \${activeTab === 'orders' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'}\`}
            onClick={() => setActiveTab('orders')}
          >
            실시간 주문 내역
            {requests.filter(r => r.status !== 'completed').length > 0 && (
              <span className="bg-brand-primary text-white text-xs px-2 py-0.5 rounded-full">
                {requests.filter(r => r.status !== 'completed').length}
              </span>
            )}
          </button>
        </div>`;

const newTabs = `        <div className="flex space-x-1 bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
          <button
            className={\`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-200 \${activeTab === 'settings' ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'}\`}
            onClick={() => setActiveTab('settings')}
          >
            서비스 및 메뉴 설정
          </button>
          <button
            className={\`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-200 \${activeTab === 'qr' ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'}\`}
            onClick={() => setActiveTab('qr')}
          >
            QR코드 생성 및 출력
          </button>
          <button
            className={\`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all duration-200 \${activeTab === 'orders' ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'}\`}
            onClick={() => setActiveTab('orders')}
          >
            실시간 주문 내역
            {requests.filter(r => r.status !== 'completed').length > 0 && (
              <span className="bg-brand-primary text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                {requests.filter(r => r.status !== 'completed').length}
              </span>
            )}
          </button>
        </div>`;

content = content.replace(oldTabs, newTabs);

// 3. Move QR Content out of settings to a new qr tab logic
const qrSectionRegex = /<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">[\s\S]*?<h3 className="text-lg font-bold text-gray-900">7\. 테이블 QR 코드 발급<\/h3>[\s\S]*?<\/div>\s*<\/>\s*\)}/m;

const match = content.match(qrSectionRegex);
if(match) {
  const qrSectionWithClosing = match[0];
  // extract just the QR block, removing it from settings
  // The structure is:
  // {shop && (
  //   <>
  //     <div ... 6. Web Push ... </div>
  //     <div ... 7. QR ... </div>
  //   </>
  // )}
  
  // Actually, wait. It's better to find the exact block for "7. 테이블 QR 코드 발급".
}
fs.writeFileSync(file, content);
