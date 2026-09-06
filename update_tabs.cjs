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

const newTabs = `        <div className="flex space-x-1 bg-gray-100 p-1.5 rounded-2xl border border-gray-200 print:hidden">
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

const startStr = `<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center justify-between mb-6 border-b pb-4">
                <h3 className="text-lg font-bold text-gray-900">7. 테이블 QR 코드 발급</h3>`;

const idxStart = content.indexOf(startStr);

if (idxStart !== -1) {
  // Find the end of this div block
  let openDivs = 0;
  let idxEnd = -1;
  const divOpen = '<div';
  const divClose = '</div>';
  
  for(let i = idxStart; i < content.length; i++) {
    if (content.substr(i, divOpen.length) === divOpen) openDivs++;
    if (content.substr(i, divClose.length) === divClose) {
      openDivs--;
      if (openDivs === 0) {
        idxEnd = i + divClose.length;
        break;
      }
    }
  }

  if (idxEnd !== -1) {
    const qrDiv = content.substring(idxStart, idxEnd);
    
    // Remove it from current position
    content = content.substring(0, idxStart) + content.substring(idxEnd);
    
    // Clean up "7. 테이블 QR 코드 발급" heading -> "테이블 QR 코드 생성 및 출력"
    const finalQrDiv = qrDiv.replace('7. 테이블 QR 코드 발급', '테이블 QR 코드 생성 및 출력');

    // We need to insert this into activeTab === 'qr' logic.
    // Let's insert it before the orders tab logic.
    const ordersTabLoc = content.indexOf("{activeTab === 'orders' ? (");
    
    if (ordersTabLoc !== -1) {
      const qrTabContent = `
        {activeTab === 'qr' && shop && (
          ${finalQrDiv.replace('className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8"', 'className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[400px] print:border-none print:shadow-none print:p-0"')}
        )}
      `;
      content = content.substring(0, ordersTabLoc) + qrTabContent + content.substring(ordersTabLoc);
    }
  }
}

fs.writeFileSync(file, content);
console.log("Updated active tabs and QR generation!");
