import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { Coffee, MessageCircle, MapPin, Wifi, KeyRound, Car, Building2, Store, X, CheckCircle2, History, ClipboardList, Info, AlertCircle, BellRing, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QR_THEMES } from '../constants/qrThemes';

interface OrderItem {
  id: string;
  type: 'drink' | 'consultation';
  content: string;
  timestamp: number;
  status?: string;
}

export default function MobileShopView() {
  const { shopId, tableNumber } = useParams();
  const [shop, setShop] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showDrinkModal, setShowDrinkModal] = useState(false);
  const [drinkCart, setDrinkCart] = useState<{name: string, quantity: number}[]>([]);
  
  const [activeCategory, setActiveCategory] = useState(0);
  const [topBannerIndex, setTopBannerIndex] = useState(0);
  const [bottomBannerIndex, setBottomBannerIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Custom Modal States
  const [statusModal, setStatusModal] = useState<{show: boolean, type: 'success' | 'error', message: string, subMessage?: string} | null>(null);
  const [orderHistory, setOrderHistory] = useState<OrderItem[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showConfirmConsult, setShowConfirmConsult] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleCopy = (text: string, type: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedItem(type);
      setTimeout(() => setCopiedItem(null), 2000);
    }
  };

  useEffect(() => {
    async function checkShopInfo() {
      try {
        const { data, error } = await supabase
          .from('shops')
          .select('*')
          .eq('id', shopId)
          .maybeSingle();
        if (data) setShop(data);
      } catch (err) {
        console.error("Shop load error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    if (shopId) checkShopInfo();

    if (shopId && tableNumber) {
      // First load active real requests from DB
      const loadDBRequests = async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { data } = await supabase
          .from('customer_requests')
          .select('*')
          .eq('shop_id', shopId)
          .eq('table_number', parseInt(tableNumber))
          .neq('status', 'archived')
          .gte('created_at', today.toISOString())
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          const mapped = data.map(req => ({
            id: req.id,
            type: req.request_type as 'drink' | 'consultation',
            content: req.request_type === 'drink' && req.details ? req.details.drink_name : '디자이너님 호출/상담',
            timestamp: new Date(req.created_at).getTime(),
            status: req.status
          }));
          setOrderHistory(mapped);
        } else {
          // Fallback to local session storage if no remote data
          const saved = sessionStorage.getItem(`orders_${shopId}_${tableNumber}`);
          if (saved) {
            try {
              setOrderHistory(JSON.parse(saved));
            } catch (e) {
              console.warn("Failed to parse history", e);
            }
          }
        }
      };
      loadDBRequests();

      // Subscribe to real-time changes
      const channel = supabase
        .channel(`mobile_shop_req_${shopId}_${tableNumber}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'customer_requests', filter: `shop_id=eq.${shopId}` },
          (payload) => {
            if (payload.new.table_number.toString() === tableNumber) {
              if (payload.new.status === 'archived') {
                setOrderHistory(prev => prev.filter(req => req.id !== payload.new.id));
              } else {
                setOrderHistory(prev => prev.map(req => req.id === payload.new.id ? { ...req, status: payload.new.status } : req));
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [shopId, tableNumber]);

  useEffect(() => {
    if (orderHistory.length > 0) {
      sessionStorage.setItem(`orders_${shopId}_${tableNumber}`, JSON.stringify(orderHistory));
    } else {
      sessionStorage.removeItem(`orders_${shopId}_${tableNumber}`);
    }
  }, [orderHistory, shopId, tableNumber]);

  const handleClearSession = () => {
    if (window.confirm('정말 서비스를 종료하고 초기화하시겠습니까?\n모든 주문/요청 내역이 삭제됩니다.')) {
      setOrderHistory([]);
      sessionStorage.removeItem(`orders_${shopId}_${tableNumber}`);
      setShowHistoryModal(false);
      setStatusModal({
        show: true,
        type: 'success',
        message: '초기화 성공',
        subMessage: '서비스 이용기록이 안전하게 삭제되었습니다.'
      });
    }
  };

  const handleCancelOrder = async (id: string) => {
    if (!window.confirm('주문을 취소하시겠습니까?')) return;
    try {
      const { error } = await supabase
        .from('customer_requests')
        .update({ status: 'cancelled' })
        .eq('id', id);
      if (error) throw error;
      setOrderHistory(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' } : o));
    } catch (err) {
      console.error(err);
      alert('취소 처리 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    if (!shop) return;
    
    // Top banner auto-slide
    const topTimer = setInterval(() => {
      if (shop.top_banners && shop.top_banners.length > 1) {
        setTopBannerIndex(prev => (prev + 1) % shop.top_banners.length);
      }
    }, 4000);

    // Bottom banner auto-slide
    const bottomTimer = setInterval(() => {
      if (shop.bottom_banners && shop.bottom_banners.length > 1) {
        setBottomBannerIndex(prev => (prev + 1) % shop.bottom_banners.length);
      }
    }, 4000);

    return () => {
      clearInterval(topTimer);
      clearInterval(bottomTimer);
    };
  }, [shop]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPosition = container.scrollLeft;
    const itemWidth = container.clientWidth;
    const newIndex = Math.round(scrollPosition / itemWidth);
    if (newIndex !== activeCategory) {
      setActiveCategory(newIndex);
    }
  };

  const scrollToCategory = (index: number) => {
    if (scrollContainerRef.current) {
      const itemWidth = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollTo({
        left: itemWidth * index,
        behavior: 'smooth'
      });
      setActiveCategory(index);
    }
  };

  const sendRequest = async (type: 'drink' | 'consultation', selectedDrinks?: {name: string, quantity: number}[]) => {
    if (isSending) return;
    setIsSending(true);

    try {
      const details = type === 'drink' && selectedDrinks 
        ? { order_items: selectedDrinks, drink_name: selectedDrinks.map(d => `${d.name} ${d.quantity}잔`).join(', ') } 
        : {};

      const requestId = crypto.randomUUID();
      const { error } = await supabase.from('customer_requests').insert([{
        id: requestId,
        shop_id: shopId,
        table_number: parseInt(tableNumber || '0'),
        request_type: type,
        details
      }]);

      if (error) throw error;
      
      await fetch('/api/webpush/notify-shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId,
          tableNumber,
          requestType: type,
          details
        })
      }).catch(err => console.error("Webhook fail", err)); 

      // Save to local history
      const newOrder: OrderItem = {
        id: requestId,
        type,
        content: type === 'drink' ? selectedDrinks!.map(d => `${d.name} x${d.quantity}`).join(', ') : '디자이너님 호출/상담',
        timestamp: Date.now(),
        status: 'pending'
      };
      setOrderHistory(prev => [newOrder, ...prev]);

      setStatusModal({
        show: true,
        type: 'success',
        message: type === 'drink' ? '음료 주문 완료!' : '상담 요청 완료!',
        subMessage: '잠시만 기다려주시면 담당자님께서 도와드릴 예정입니다.'
      });

      if (type === 'drink') {
        setShowDrinkModal(false);
        setDrinkCart([]);
      }
      setShowConfirmConsult(false);
    } catch (err: any) {
      console.error(err);
      setStatusModal({
        show: true,
        type: 'error',
        message: '요청 실패',
        subMessage: err.message
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleRequestDrinkClick = () => {
    if (shop?.drinks_menu && shop.drinks_menu.length > 0) {
      setShowDrinkModal(true);
    } else {
      // Fallback for custom text if no menu set
      setStatusModal({
        show: true,
        type: 'error',
        message: '준비된 메뉴가 없습니다.',
        subMessage: '매장에 문의해주세요.'
      });
    }
  };

  const handleConsultationClick = () => {
    setShowConfirmConsult(true);
  };

  const updateCartQuantity = (name: string, diff: number) => {
    setDrinkCart(prev => {
      const existing = prev.find(item => item.name === name);
      if (existing) {
        const newQuantity = existing.quantity + diff;
        if (newQuantity <= 0) {
          return prev.filter(item => item.name !== name);
        }
        return prev.map(item => item.name === name ? { ...item, quantity: newQuantity } : item);
      } else if (diff > 0) {
        return [...prev, { name, quantity: diff }];
      }
      return prev;
    });
  };

  if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-gray-500">매장 정보를 불러오고 있습니다...</div>;
  if (!shop) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-gray-500">매장 정보를 찾을 수 없습니다.</div>;

  const validDrinks = shop.drinks_menu ? shop.drinks_menu.filter((d:any) => d.available) : [];
  
  // Theme logic
  const selectedTheme = QR_THEMES.find(t => t.id === shop.theme_id) || QR_THEMES[0];
  const brandColor = shop.theme_color || selectedTheme.primary;
  const brandTextColor = shop.theme_text_color || '#ffffff';
  const bgColor = selectedTheme.bg;
  const cardColor = selectedTheme.cardBg;
  const textColor = selectedTheme.text;
  const subTextColor = selectedTheme.subText;
  const borderColor = selectedTheme.border;

  return (
    <div className="min-h-screen pb-20 pt-16" style={{ backgroundColor: bgColor }}>
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --brand-dynamic: ${brandColor};
          --brand-dynamic-text: ${brandTextColor};
          --theme-bg: ${bgColor};
          --theme-card: ${cardColor};
          --theme-text: ${textColor};
          --theme-subtext: ${subTextColor};
          --theme-border: ${borderColor};
        }
        .text-brand-dynamic { color: var(--brand-dynamic); }
        .bg-brand-dynamic { background-color: var(--brand-dynamic); }
        .text-brand-dynamic-text { color: var(--brand-dynamic-text); }
        .bg-brand-dynamic-10 { background-color: rgba(${hexToRgb(brandColor)}, 0.1); }
        .bg-brand-dynamic-20 { background-color: rgba(${hexToRgb(brandColor)}, 0.2); }
        .border-brand-dynamic { border-color: var(--brand-dynamic); }
        .ring-brand-dynamic { --tw-ring-color: var(--brand-dynamic); }

        .theme-card { background-color: var(--theme-card); border-color: var(--theme-border); box-shadow: 0 4px 20px -2px rgba(0,0,0,0.05); }
        .theme-text { color: var(--theme-text); }
        .theme-subtext { color: var(--theme-subtext); }
      `}} />

      <div 
        className="fixed top-0 left-0 right-0 z-40 px-4 py-3 flex items-center shadow-sm"
        style={{ backgroundColor: brandColor, color: brandTextColor }}
      >
        <div className="flex items-center gap-2">
          {(() => {
            const isImageOnly = shop.logo_url?.startsWith('[IMAGE_ONLY]');
            const realLogoUrl = isImageOnly ? shop.logo_url.replace('[IMAGE_ONLY]', '') : shop.logo_url;
            return (
              <>
                {realLogoUrl ? (
                  <img src={realLogoUrl} alt="Shop Logo" className={`${isImageOnly ? 'h-10' : 'h-8'} w-auto object-contain ${!isImageOnly ? 'rounded-lg bg-white/50 p-0.5' : ''}`} />
                ) : (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${brandTextColor === '#ffffff' ? 'bg-white/20' : 'bg-black/10'}`}>
                    <Building2 className="w-4 h-4" />
                  </div>
                )}
                {!isImageOnly && <h1 className="text-base font-black truncate" style={{ color: brandTextColor }}>{shop.name}</h1>}
              </>
            );
          })()}
        </div>
        {tableNumber && (
          <div className="ml-auto">
            <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full ${brandTextColor === '#ffffff' ? 'bg-white/20' : 'bg-black/10'}`}>
              Table {tableNumber}석
            </span>
          </div>
        )}
      </div>

      {shop.top_banners && shop.top_banners.length > 0 && (

        <div className="relative w-full h-24 sm:h-32 bg-gray-100 mb-6 overflow-hidden">
          <AnimatePresence mode="popLayout">
            {shop.top_banners.map((banner: any, i: number) => i === topBannerIndex && (
              <motion.div
                key={`${banner.id || 'banner'}-${i}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center p-4"
                onClick={() => banner.link && window.open(banner.link, '_blank')}
                style={{ cursor: banner.link ? 'pointer' : 'default', background: `linear-gradient(135deg, rgba(${hexToRgb(brandColor)}, 0.1), rgba(${hexToRgb(brandColor)}, 0.05))` }}
              >
                {banner.type === 'image' ? (
                  <img src={banner.content} alt="이벤트 배너" className="w-full h-full object-cover rounded-xl shadow-sm border border-black/5" />
                ) : (
                  <div className="text-center w-full flex flex-col items-center justify-center h-full px-2">
                    {banner.title && <h4 className="font-extrabold text-sm mb-1 line-clamp-1" style={{ color: brandColor }}>{banner.title}</h4>}
                    <p className="font-bold text-[0.85rem] sm:text-[0.95rem] whitespace-pre-line leading-snug line-clamp-2 theme-text">{banner.content}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {shop.top_banners.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
              {shop.top_banners.map((_:any, i:number) => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${i === topBannerIndex ? 'w-4 bg-brand-dynamic' : 'w-1.5 bg-gray-300'}`} />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="px-5 space-y-4 max-w-lg mx-auto">
        <h2 className="text-lg font-bold ml-1 mb-4 flex items-center gap-2 theme-text">
          <BellRing className="w-5 h-5 theme-subtext"/> 편의 서비스 요청
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={handleRequestDrinkClick}
            disabled={isSending}
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl shadow-sm border border-brand-dynamic/20 hover:bg-brand-dynamic-10 transition-all text-center group disabled:opacity-50 theme-card"
          >
            <div className="w-12 h-12 rounded-full bg-brand-dynamic-10 flex items-center justify-center group-hover:scale-110 transition-transform">
               <Coffee className="w-6 h-6 text-brand-dynamic" />
            </div>
            <span className="font-bold text-sm theme-text">음료 주문</span>
          </button>
          <button 
            onClick={handleConsultationClick}
            disabled={isSending}
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl shadow-sm border border-brand-dynamic/20 hover:bg-brand-dynamic-10 transition-all text-center group disabled:opacity-50 theme-card"
          >
            <div className="w-12 h-12 rounded-full bg-brand-dynamic-10 flex items-center justify-center group-hover:scale-110 transition-transform">
               <MessageCircle className="w-6 h-6 text-brand-dynamic" />
            </div>
            <span className="font-bold text-sm theme-text">디자이너 상담</span>
          </button>
        </div>

        {/* Procedures Menu */}
        {shop.procedure_menu && shop.procedure_menu.length > 0 && shop.procedure_menu.some((c:any) => c.items.length > 0) && (
          <div className="mt-8">
            <h2 className="text-lg font-bold ml-1 mb-4 flex items-center gap-2 theme-text">
              <ClipboardList className="w-5 h-5 theme-subtext"/> 시술 메뉴판
            </h2>
            <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-4 snap-x">
              {shop.procedure_menu.map((cat: any, i: number) => cat.items.length > 0 && (
                <button
                  key={i}
                  onClick={() => scrollToCategory(i)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm transition-colors snap-start ${activeCategory === i ? 'bg-brand-dynamic text-brand-dynamic-text shadow-sm' : 'bg-white/50 text-gray-600 hover:bg-gray-200 border border-transparent'}`}
                >
                  {cat.category}
                </button>
              ))}
            </div>
            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory"
            >
              {shop.procedure_menu.map((cat: any, i: number) => cat.items.length > 0 && (
                <div key={i} className="min-w-full px-1 snap-start">
                  <div className="rounded-2xl shadow-sm border overflow-hidden theme-card">
                    <div className="divide-y divide-gray-50/50">
                      {cat.items.map((item: any, j: number) => (
                        <div key={j} className="flex items-center justify-between px-5 py-4 hover:bg-black/5">
                          <span className="font-medium text-[0.95rem] theme-text">{item.name}</span>
                          <span className="font-bold text-brand-dynamic text-[0.95rem]">{item.price}원</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-lg font-bold ml-1 mt-8 mb-4 flex items-center gap-2 theme-text">
          <Store className="w-5 h-5 theme-subtext"/> 매장 이용 안내
        </h2>
        <div className="rounded-2xl shadow-sm border divide-y divide-gray-100 overflow-hidden theme-card">
          {shop.wifi_info && (
            <div className="p-5 flex items-start gap-4">
              <div className="p-2 rounded-xl bg-black/5 theme-subtext"><Wifi className="w-5 h-5" /></div>
              <div className="flex-1 w-full overflow-hidden">
                 <h4 className="font-bold text-sm theme-text mb-2">Wi-Fi</h4>
                 {(() => {
                   try {
                     const parsed = JSON.parse(shop.wifi_info);
                     if (parsed && typeof parsed === 'object') {
                       return (
                         <div className="grid grid-cols-2 gap-2">
                           {parsed.id && (
                             <div className="flex flex-col justify-between bg-black/5 p-3 rounded-xl overflow-hidden">
                               <div className="flex flex-col mb-1">
                                 <span className="text-[10px] theme-subtext font-bold mb-0.5">아이디 (SSID)</span>
                                 <span className="text-sm font-bold theme-text truncate">{parsed.id}</span>
                               </div>
                             </div>
                           )}
                           {parsed.pw && (
                             <div className="flex flex-col justify-between bg-black/5 p-3 rounded-xl overflow-hidden">
                               <div className="flex flex-col mb-2">
                                 <span className="text-[10px] theme-subtext font-bold mb-0.5">비밀번호</span>
                                 <span className="text-sm font-bold theme-text tracking-wide truncate">{parsed.pw}</span>
                               </div>
                               <button 
                                 onClick={() => handleCopy(parsed.pw, 'wifi_pw')}
                                 className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm font-bold text-xs theme-text hover:bg-gray-50 transition-colors w-full border border-black/5"
                               >
                                 {copiedItem === 'wifi_pw' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 opacity-70" />}
                                 <span className={copiedItem === 'wifi_pw' ? 'text-green-600' : ''}>{copiedItem === 'wifi_pw' ? '복사완료' : 'PW 복사'}</span>
                               </button>
                             </div>
                           )}
                         </div>
                       );
                     }
                   } catch {}
                   
                   return (
                     <div className="flex items-center justify-between bg-black/5 p-3 rounded-xl">
                       <span className="text-sm font-bold theme-text tracking-wide truncate">{shop.wifi_info}</span>
                       <button 
                         onClick={() => handleCopy(shop.wifi_info, 'wifi')}
                         className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm font-bold text-xs theme-text hover:bg-gray-50 transition-colors shrink-0 border border-black/5"
                       >
                         {copiedItem === 'wifi' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 opacity-70" />}
                         <span className={copiedItem === 'wifi' ? 'text-green-600' : ''}>{copiedItem === 'wifi' ? '복사완료' : '복사'}</span>
                       </button>
                     </div>
                   );
                 })()}
              </div>
            </div>
          )}
          {shop.restroom_pw && (
            <div className="p-5 flex items-start gap-4">
              <div className="p-2 rounded-xl bg-black/5 theme-subtext"><KeyRound className="w-5 h-5" /></div>
              <div className="flex-1 w-full overflow-hidden">
                 <h4 className="font-bold text-sm theme-text mb-2">화장실 비밀번호</h4>
                 <div className="flex items-center justify-between mt-1">
                   <span className="text-sm font-bold theme-text tracking-wide truncate">{shop.restroom_pw}</span>
                 </div>
              </div>
            </div>
          )}
          {shop.address && (
            <div className="p-5 flex items-start gap-4">
              <div className="p-2 rounded-xl bg-black/5 theme-subtext"><MapPin className="w-5 h-5" /></div>
              <div>
                 <h4 className="font-bold text-sm theme-text">매장 주소</h4>
                 <p className="text-sm mt-1 theme-subtext opacity-80">{shop.address}</p>
              </div>
            </div>
          )}
          {shop.parking_info && (
            <div className="p-5 flex items-start gap-4">
              <div className="p-2 rounded-xl bg-black/5 theme-subtext"><Car className="w-5 h-5" /></div>
              <div>
                 <h4 className="font-bold text-sm theme-text">주차 안내</h4>
                 <p className="text-sm mt-1 whitespace-pre-line theme-subtext opacity-80">{shop.parking_info}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {shop.bottom_banners && shop.bottom_banners.length > 0 && (
        <div className="mt-10 mb-10 w-full">
          <div className="relative w-full h-32 sm:h-40 bg-gray-100 overflow-hidden">
            <AnimatePresence mode="popLayout">
              {shop.bottom_banners.map((banner: any, i: number) => i === bottomBannerIndex && (
                <motion.div
                  key={`${banner.id || 'banner'}-${i}`}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex items-center justify-center p-4 bg-white"
                  onClick={() => banner.link && window.open(banner.link, '_blank')}
                  style={{ cursor: banner.link ? 'pointer' : 'default' }}
                >
                  {banner.type === 'image' ? (
                    <img src={banner.content} alt="하단 배너" className="w-full h-full object-cover rounded-xl shadow-sm border border-gray-100" />
                  ) : (
                    <div className="text-center w-full bg-gray-50 h-full rounded-xl flex flex-col items-center justify-center px-4 border border-gray-100">
                      {banner.title && <h4 className="font-extrabold text-blue-700 text-sm mb-1 line-clamp-1">{banner.title}</h4>}
                      <p className="font-bold text-gray-800 text-[0.85rem] sm:text-[0.95rem] whitespace-pre-line leading-snug line-clamp-2">{banner.content}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {shop.bottom_banners.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
                {shop.bottom_banners.map((_:any, i:number) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all ${i === bottomBannerIndex ? 'w-4 bg-gray-800' : 'w-1.5 bg-gray-300'}`} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* End Service Button */}
      {orderHistory.length > 0 && (
        <div className="px-5 mt-8 mb-24 max-w-lg mx-auto flex justify-center pb-8">
          <button 
            onClick={handleClearSession}
            className="px-6 py-2.5 rounded-full border border-black/10 text-gray-400 opacity-60 text-xs font-bold hover:bg-black/5 hover:opacity-100 flex items-center gap-2 transition-all"
          >
            서비스 종료 및 주문기록 지우기
          </button>
        </div>
      )}

      {/* Floating Order History Button */}
      {orderHistory.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button 
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-3 bg-gray-900 text-white font-bold py-3.5 px-6 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all"
          >
            <ClipboardList className="w-5 h-5 text-brand-dynamic" />
            내 주문 내역
            <span className="w-5 h-5 bg-brand-dynamic text-brand-dynamic-text rounded-full flex items-center justify-center text-[10px]">
              {orderHistory.length}
            </span>
          </button>
        </div>
      )}

      {/* Drink Order Modal */}
      {showDrinkModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center pb-0 sm:pb-0">
          <div className="w-full sm:w-96 sm:rounded-3xl rounded-t-3xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-10 theme-card border-none">
            <div className="px-6 py-6 border-b border-black/5 flex items-center justify-between">
              <h3 className="text-xl font-bold theme-text">어떤 음료를 원하시나요?</h3>
              <button onClick={() => setShowDrinkModal(false)} className="p-2 theme-subtext opacity-80 hover:opacity-100">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="overflow-y-auto px-6 py-4 flex-1">
              <div className="space-y-3">
                {validDrinks.length > 0 ? validDrinks.map((drink: any, i: number) => {
                  const cartItem = drinkCart.find(item => item.name === drink.name);
                  const quantity = cartItem ? cartItem.quantity : 0;
                  
                  return (
                    <div key={i} className="flex items-center justify-between p-4 border border-black/5 rounded-2xl bg-black/5">
                      <span className="font-bold theme-text">{drink.name}</span>
                      <div className="flex items-center gap-3 bg-black/5 rounded-full px-1 py-1">
                        <button 
                          className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center theme-text font-bold text-lg disabled:opacity-30"
                          onClick={() => updateCartQuantity(drink.name, -1)}
                          disabled={quantity === 0}
                        >
                          -
                        </button>
                        <span className="w-4 text-center font-bold theme-text">{quantity}</span>
                        <button 
                          className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center theme-text font-bold text-lg"
                          onClick={() => updateCartQuantity(drink.name, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                }) : <p className="text-sm theme-subtext py-4 text-center">준비된 음료가 없습니다.</p>}
              </div>
            </div>
            
            <div className="p-6 border-t border-black/5 sm:rounded-b-3xl">
              <button 
                className="w-full text-center font-bold bg-brand-dynamic text-brand-dynamic-text py-4 rounded-xl disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-dynamic/20"
                disabled={drinkCart.length === 0 || isSending}
                onClick={() => sendRequest('drink', drinkCart)}
              >
                {isSending ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : '주문하기'} 
                {drinkCart.length > 0 && <span className="bg-white text-gray-900 px-2 py-0.5 rounded-full text-[10px] ml-1 font-black">{drinkCart.reduce((sum, item) => sum + item.quantity, 0)}잔</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Consultation Confirmation Modal */}
      {showConfirmConsult && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-xs rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl theme-card border-none"
          >
            <div className="w-16 h-16 bg-brand-dynamic-10 rounded-full flex items-center justify-center mb-4">
               <MessageCircle className="w-8 h-8 text-brand-dynamic" />
            </div>
            <h3 className="text-lg font-bold mb-2 theme-text">담당 디자이너 상담</h3>
            <p className="text-sm opacity-80 mb-8 leading-relaxed theme-subtext">
              시술에 대해 궁금한 점이 있으신가요?<br/>클릭하시면 담당자님을 호출합니다.
            </p>
            <div className="flex flex-col w-full gap-2">
              <button 
                onClick={() => sendRequest('consultation')}
                disabled={isSending}
                className="w-full bg-brand-dynamic text-brand-dynamic-text font-bold py-3.5 rounded-xl hover:opacity-90 transition-colors shadow-lg shadow-brand-dynamic/20"
              >
                {isSending ? '요청 중...' : '지금 상담 요청하기'}
              </button>
              <button 
                onClick={() => setShowConfirmConsult(false)}
                className="w-full bg-black/5 font-bold py-3.5 rounded-xl hover:bg-black/10 transition-colors theme-text"
                disabled={isSending}
              >
                취소
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Order History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">
          <div className="w-full sm:w-96 rounded-t-3xl sm:rounded-3xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom-5 theme-card border-none">
            <div className="px-6 py-6 flex items-center justify-between border-b border-black/5">
               <div className="flex items-center gap-2">
                 <History className="w-5 h-5 text-brand-dynamic" />
                 <h3 className="text-lg font-bold theme-text">나의 주문/요청 내역</h3>
               </div>
               <button onClick={() => setShowHistoryModal(false)} className="p-1 hover:bg-black/5 rounded-lg">
                 <X className="w-6 h-6 theme-subtext" />
               </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
               <div className="space-y-4">
                  {orderHistory.map((item) => (
                    <div key={item.id} className={`flex gap-4 p-4 rounded-2xl ${item.status === 'cancelled' ? 'bg-black/5 opacity-50' : 'bg-black/5'}`}>
                       <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center bg-brand-dynamic-10 text-brand-dynamic`}>
                          {item.type === 'drink' ? <Coffee className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
                       </div>
                       <div className="flex-1 w-full overflow-hidden">
                          <div className="flex items-center justify-between mb-1">
                             <span className="text-xs font-bold theme-subtext">
                                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </span>
                             <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${item.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-white border border-gray-100 theme-text'}`}>
                               {item.status === 'cancelled' ? '취소됨' : '요청중'}
                             </span>
                          </div>
                          <div className="flex flex-col gap-2">
                            <p className="text-sm font-bold leading-tight theme-text">{item.content}</p>
                            {item.status !== 'cancelled' && (
                              <button 
                                onClick={() => handleCancelOrder(item.id)}
                                className="self-end text-[10px] font-bold text-gray-400 hover:text-red-500 transition-colors border border-gray-200 px-2 py-1 rounded-md"
                              >
                                주문취소
                              </button>
                            )}
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
            <div className="p-6 border-t border-black/5 flex flex-col gap-2">
               <button 
                 onClick={handleClearSession}
                 className="w-full py-3.5 bg-black/5 text-gray-400 font-bold rounded-2xl hover:bg-black/10 transition-colors"
               >
                 서비스 종료 (주문기록 지우기)
               </button>
               <button 
                 onClick={() => setShowHistoryModal(false)}
                 className="w-full py-4 bg-brand-dynamic text-brand-dynamic-text font-black rounded-2xl"
               >
                 확인
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Status/Success Modal */}
      <AnimatePresence>
        {statusModal?.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="w-full max-w-sm rounded-[32px] p-8 flex flex-col items-center text-center shadow-2xl relative border-none theme-card"
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6`}>
                {statusModal.type === 'success' ? (
                  <div className="bg-brand-dynamic-10 w-full h-full rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-brand-dynamic" />
                  </div>
                ) : (
                  <div className="bg-red-50 w-full h-full rounded-full flex items-center justify-center">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-black theme-text mb-3">{statusModal.message}</h3>
              <p className="text-[0.95rem] theme-subtext font-medium leading-relaxed mb-8 whitespace-pre-line opacity-80">
                {statusModal.subMessage}
              </p>
              <button 
                onClick={() => setStatusModal(null)}
                className={`w-full py-4 rounded-2xl font-black text-lg shadow-lg hover:brightness-95 transition-all ${statusModal.type === 'success' ? 'bg-brand-dynamic text-brand-dynamic-text shadow-brand-dynamic/20' : 'bg-red-500 text-white shadow-red-200'}`}
              >
                확인
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
    "79, 70, 229";
}
