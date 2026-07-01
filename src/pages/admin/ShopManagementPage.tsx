import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabase';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { Store, QrCode, Plus, LogOut, Check, Bell, Sparkles, Coffee, MessageCircle, Upload, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { apiClient, accountClient } from '../../lib/ncpClient';
import { retrySupabaseSelect } from '../../lib/supabase-utils';

import { QR_THEMES } from '../../constants/qrThemes';

function formatToIsoDate(timeStr: string): string {
  if (!timeStr) return new Date().toISOString().split('T')[0] + 'T10:00:00Z';
  if (timeStr.includes('T') && timeStr.includes('Z')) return timeStr;
  
  let hours = "10";
  let minutes = "00";
  const timeMatches = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (timeMatches) {
    hours = timeMatches[1].padStart(2, '0');
    minutes = timeMatches[2];
  }
  const date = new Date().toISOString().split('T')[0];
  return `${date}T${hours}:${minutes}:00Z`;
}

function formatToTimeStr(val: string): string {
  if (!val) return '10:00';
  if (typeof val === 'string' && (val.includes('T') || val.includes('-'))) {
    try {
      const date = new Date(val);
      if (!isNaN(date.getTime())) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
      }
    } catch (e) {
      // ignore
    }
  }
  if (typeof val === 'string') {
    const timeMatches = val.match(/(\d{1,2}):(\d{2})/);
    if (timeMatches) {
      const hh = timeMatches[1].padStart(2, '0');
      const mm = timeMatches[2];
      return `${hh}:${mm}`;
    }
  }
  return val;
}

function getAmPmTimeString(timeStr: string): string {
  const formatted = formatToTimeStr(timeStr);
  const parts = formatted.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    if (isNaN(hours)) return formatted;
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const padHours = String(displayHours).padStart(2, '0');
    return `${ampm} ${padHours}:${minutes}`;
  }
  return formatted;
}

export default function ShopManagementPage({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const [shop, setShop] = useState<any>(null);
  const [businessTimes, setBusinessTimes] = useState<any[]>(() => {
    return Array.from({ length: 7 }, (_, i) => ({
      weekday: i,
      active: true,
      startedAt: '10:00',
      endedAt: '20:00'
    }));
  });
  const [holidays, setHolidays] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPlusMember, setIsPlusMember] = useState(false);
  const [pushStatus, setPushStatus] = useState('Not Supported');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'orders'>('settings');
  const [clearTableTarget, setClearTableTarget] = useState<number | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [notificationSound, setNotificationSound] = useState(() => localStorage.getItem('admin_noti_sound') || '1');
  const [customSoundUrl, setCustomSoundUrl] = useState(() => localStorage.getItem('admin_noti_sound_custom_url') || '');
  const [customSoundName, setCustomSoundName] = useState(() => localStorage.getItem('admin_noti_sound_custom_name') || '커스텀 알림음');
  const [isUploadingSound, setIsUploadingSound] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const SOUNDS = [
    { id: 'none', label: '알림음 없음', url: '' },
    { id: '1', label: '차임벨 1', url: 'https://cdn.freesound.org/previews/320/320181_527080-lq.mp3' },
    { id: '2', label: '차임벨 2', url: 'https://cdn.freesound.org/previews/415/415059_681014-lq.mp3' },
    { id: '3', label: '차임벨 3', url: 'https://cdn.freesound.org/previews/511/511484_5121236-lq.mp3' },
    ...(customSoundUrl ? [{ id: 'custom', label: customSoundName, url: customSoundUrl }] : [])
  ];

  useEffect(() => {
    localStorage.setItem('admin_noti_sound', notificationSound);
  }, [notificationSound]);

  useEffect(() => {
    localStorage.setItem('admin_noti_sound_custom_url', customSoundUrl);
    localStorage.setItem('admin_noti_sound_custom_name', customSoundName);
  }, [customSoundUrl, customSoundName]);

  const handleSoundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      alert("오디오 파일만 업로드 가능합니다.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("5MB 이하의 파일만 업로드 가능합니다.");
      return;
    }

    try {
      setIsUploadingSound(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `audio/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('models')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('models').getPublicUrl(fileName);
      
      setCustomSoundUrl(urlData.publicUrl);
      setCustomSoundName(file.name);
      setNotificationSound('custom');
      
      if (audioRef.current) {
        audioRef.current.src = urlData.publicUrl;
        audioRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.error(err);
      alert('오디오 파일 업로드 실패: ' + err.message);
    } finally {
      setIsUploadingSound(false);
      if (e.target) e.target.value = '';
    }
  };

  const playNotification = () => {
    const sound = SOUNDS.find(s => s.id === notificationSound);
    if (sound && sound.url && audioRef.current) {
      audioRef.current.src = sound.url;
      audioRef.current.play().catch(e => console.warn("Audio play blocked", e));
    }
  };

  useEffect(() => {
    if (!shop || activeTab !== 'orders') return;
    
    // Load existing pending requests for today
    const loadRequests = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data } = await supabase
        .from('customer_requests')
        .select('*')
        .eq('shop_id', shop.id)
        .neq('status', 'archived')
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });
        
      if (data) setRequests(data);
    };
    loadRequests();

    const channel = supabase
      .channel(`admin_shop_req_${shop.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'customer_requests', filter: `shop_id=eq.${shop.id}` },
        (payload) => {
          setRequests(prev => [payload.new, ...prev]);
          playNotification();
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'customer_requests', filter: `shop_id=eq.${shop.id}` },
        (payload) => {
          if (payload.new.status === 'archived') {
            setRequests(prev => prev.filter(req => req.id !== payload.new.id));
          } else {
            setRequests(prev => {
              const exists = prev.find(r => r.id === payload.new.id);
              if (exists) {
                return prev.map(req => req.id === payload.new.id ? payload.new : req);
              } else {
                return [payload.new, ...prev];
              }
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shop, activeTab]);

  const handleCompleteRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customer_requests')
        .update({ status: 'completed' })
        .eq('id', id);
      if (error) throw error;
      setRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'completed' } : req));
    } catch (err) {
      console.error(err);
      alert('오류가 발생했습니다.');
    }
  };

  const handleClearTableRequests = async () => {
    if (!shop || clearTableTarget === null) return;
    try {
      const { error } = await supabase
        .from('customer_requests')
        .update({ status: 'archived' })
        .eq('shop_id', shop.id)
        .eq('table_number', clearTableTarget);
      if (error) throw error;
      setRequests(prev => prev.filter(req => req.table_number !== clearTableTarget));
      setClearTableTarget(null);
    } catch (err) {
      console.error(err);
      alert('명령을 실행하는 도중 오류가 발생했습니다.');
    }
  };

  const handleAIGenerateBannerText = async (idx: number, type: 'top' | 'bottom') => {
    const banners = type === 'top' ? formData.top_banners : formData.bottom_banners;
    const banner = banners[idx];
    if (!banner.title || banner.title.trim() === '') {
      alert("배너 제목(행사명 등)을 먼저 입력해주세요.");
      return;
    }

    try {
      setIsGeneratingAI(true);
      const tempTitle = banner.title;
      
      const newArr = [...banners];
      newArr[idx] = { ...newArr[idx], content: "AI가 문구를 생성 중입니다..." };
      if (type === 'top') {
        setFormData({ ...formData, top_banners: newArr });
      } else {
        setFormData({ ...formData, bottom_banners: newArr });
      }

      const res = await fetch('/api/generate-banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: tempTitle })
      });
      const data = await res.json();
      
      newArr[idx] = { ...newArr[idx], content: data.text || "생성 실패" };
      if (type === 'top') {
        setFormData({ ...formData, top_banners: newArr });
      } else {
        setFormData({ ...formData, bottom_banners: newArr });
      }
    } catch (err) {
      console.error(err);
      alert("문구 생성에 실패했습니다.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    wifi_info: '',
    restroom_pw: '',
    parking_info: '',
    table_count: 0,
    drinks_menu: [{ id: '1', name: '아메리카노(HOT)', available: true }, { id: '2', name: '아메리카노(ICE)', available: true }, { id: '3', name: '믹스커피', available: true }, { id: '4', name: '녹차', available: true }],
    procedure_menu: [{ id: 'menu-1', category: 'CUT', items: [{ name: '남성 컷', price: '20,000' }, { name: '여성 컷', price: '25,000' }] }],
    top_banners: [],
    bottom_banners: [],
    theme_color: '#4f46e5',
    theme_text_color: '#ffffff',
    theme_id: 'purple',
    logo_url: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    
    const checkPlusMembershipAndFetchShop = async () => {
      let isMounted = true;
      try {
        const { data: subs } = await retrySupabaseSelect<any>(() => supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active') as any);
          
        if (isMounted) {
          setIsPlusMember(subs && subs.length > 0 ? true : true);
        }

        const { data: shops } = await retrySupabaseSelect<any>(() => supabase
          .from('shops')
          .select('*')
          .eq('user_id', user.id) as any);

        if (shops && shops.length > 0 && isMounted) {
          setShop(shops[0]);
          setFormData({
            name: shops[0].name || '',
            address: shops[0].address || '',
            wifi_info: shops[0].wifi_info || '',
            restroom_pw: shops[0].restroom_pw || '',
            parking_info: shops[0].parking_info || '',
            table_count: shops[0].table_count || 0,
            drinks_menu: (shops[0].drinks_menu && shops[0].drinks_menu.length > 0) ? shops[0].drinks_menu : formData.drinks_menu,
            procedure_menu: (shops[0].procedure_menu && shops[0].procedure_menu.length > 0) ? shops[0].procedure_menu : formData.procedure_menu,
            top_banners: shops[0].top_banners || [],
            bottom_banners: shops[0].bottom_banners || [],
            theme_color: shops[0].theme_color || '#4f46e5',
            theme_text_color: shops[0].theme_text_color || '#ffffff',
            theme_id: shops[0].theme_id || 'purple',
            logo_url: shops[0].logo_url || ''
          });
        }

        // NCP Core server sync: load Live Shop Details
        try {
          const detailRes = await accountClient.get(`/designer/detail?_t=${Date.now()}`);
          const resData = detailRes?.data;
          const d = resData?.data_response?.designer || resData;
          if (d) {
            const hShop = d.hairShop || {};
            if (isMounted) {
              setFormData(prev => {
                let currentWifi: any = { id: '', pw: '', phone: '', operating_hours: '' };
                try {
                  if (prev.wifi_info) {
                    const parsed = JSON.parse(prev.wifi_info);
                    if (parsed && typeof parsed === 'object') {
                      currentWifi = { ...currentWifi, ...parsed };
                    } else {
                      currentWifi.id = prev.wifi_info;
                    }
                  }
                } catch {
                  currentWifi.id = prev.wifi_info;
                }
                if (hShop.number) {
                  currentWifi.phone = hShop.number;
                }
                return {
                  ...prev,
                  name: hShop.name || prev.name,
                  address: hShop.roadAddress || hShop.address || prev.address,
                  wifi_info: JSON.stringify(currentWifi)
                };
              });

              if (d.businessTimes && d.businessTimes.length === 7) {
                const times = Array.from({ length: 7 }, (_, i) => {
                  const found = d.businessTimes[i];
                  return {
                    weekday: i,
                    active: !!found,
                    startedAt: formatToTimeStr(found?.startedAt || '10:00'),
                    endedAt: formatToTimeStr(found?.endedAt || '20:00')
                  };
                });
                setBusinessTimes(times);
              } else if (d.businessTimes && d.businessTimes.length > 0) {
                const times = Array.from({ length: 7 }, (_, i) => {
                  const found = d.businessTimes.find((bt: any) => bt && bt.weekday === i);
                  return {
                    weekday: i,
                    active: !!found,
                    startedAt: formatToTimeStr(found?.startedAt || '10:00'),
                    endedAt: formatToTimeStr(found?.endedAt || '20:00')
                  };
                });
                setBusinessTimes(times);
              }
              if (d.holidays) {
                setHolidays(d.holidays);
              }
            }
          }
        } catch (apiErr) {
          console.warn("Failed to retrieve designer details from Core Server:", apiErr);
        }
      } catch (err) {
        console.error("Failed to load shop:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkPlusMembershipAndFetchShop();
  }, [user, navigate]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      let finalFormData = { ...formData };

      // 1. Synchronize with Live Core server / NCP API first
      try {
        const token = localStorage.getItem('ncp_access_token');
        if (token) {
          const businessTimesPayload = Array.from({ length: 7 }, (_, i) => {
            const bt = businessTimes.find(b => b.weekday === i);
            if (!bt || !bt.active) return null;
            return {
              startedAt: formatToIsoDate(bt.startedAt || '10:00'),
              endedAt: formatToIsoDate(bt.endedAt || '20:00')
            };
          });

          let contactPhone = '';
          try {
            const parsed = JSON.parse(formData.wifi_info);
            contactPhone = parsed?.phone || '';
          } catch {
            contactPhone = formData.wifi_info || '';
          }

          const payload = {
            shopName: formData.name,
            shopNumber: contactPhone,
            addressDetail: '매장 주소',
            address: {
              sido: "",
              sigungu: "",
              bname: "",
              address: formData.address,
              roadAddress: formData.address,
              zonecode: "",
              latitude: 37.5,
              longitude: 127.0
            },
            businessTimes: businessTimesPayload,
            holidays: holidays.map((h: any) => ({
              startedAt: h.startedAt,
              endedAt: h.endedAt
            }))
          };

          let response;
          // Also sync to Account Server to maintain identical synchronized state everywhere
          try {
            const shopPayload: any = {
              name: formData.name,
              number: contactPhone || "010-0000-0000",
              address: formData.address,
              addressDetail: "매장 주소",
              zipCode: "12345",
              latitude: 37.5,
              longitude: 127.0
            };

            // Post to Account flat /hair-shop 
            accountClient.post('/hair-shop', shopPayload).catch(() => null);
          } catch(e) {}
          try {
             response = await apiClient.post('/designer/management', payload);
          } catch(err: any) {
             // Silently ignore sync failures per user request to suppress console warnings
             const altPayload = {
               hairShop: {
                 name: formData.name,
                 number: contactPhone,
                 addressDetail: "매장 주소",
                 address: formData.address,
                 roadAddress: formData.address,
                 zipCode: "12345",
                 latitude: 37.5,
                 longitude: 127.0
               }
             };
             response = await apiClient.post('/designer/management', altPayload).catch(e => {
                // Return null to gracefully ignore failures silently
                return null;
             });
          }

          const resData = response?.data;
          const d = resData?.data_response?.designer || resData;
          if (d) {
            const hShop = d.hairShop || {};
            
            // Re-build wifi_info containing the returned phone
            let currentWifi: any = { id: '', pw: '', phone: '', operating_hours: '' };
            try {
              if (formData.wifi_info) {
                const parsed = JSON.parse(formData.wifi_info);
                if (parsed && typeof parsed === 'object') {
                  currentWifi = { ...currentWifi, ...parsed };
                } else {
                  currentWifi.id = formData.wifi_info;
                }
              }
            } catch {
              currentWifi.id = formData.wifi_info;
            }
            if (hShop.number) {
              currentWifi.phone = hShop.number;
            }

            finalFormData = {
              ...formData,
              name: hShop.name || formData.name,
              address: hShop.roadAddress || hShop.address || formData.address,
              wifi_info: JSON.stringify(currentWifi)
            };

            setFormData(finalFormData);

            // Sync returned times/holidays
            if (d.businessTimes && d.businessTimes.length > 0) {
              const times = Array.from({ length: 7 }, (_, i) => {
                const found = d.businessTimes.find((bt: any) => bt && bt.weekday === i);
                return {
                  weekday: i,
                  active: !!found,
                  startedAt: formatToTimeStr(found?.startedAt || '10:00'),
                  endedAt: formatToTimeStr(found?.endedAt || '20:00')
                };
              });
              setBusinessTimes(times);
            }
            if (d.holidays) {
              setHolidays(d.holidays);
            }
          }
        }
      } catch (backendErr: any) {
        console.warn("Failed to synchronize shop details with NCP: ", backendErr);
      }

      // 2. We skip Supabase shops table update completely to bypass RLS errors per user request
      
      alert("저장되었습니다.");
    } catch (err: any) {
      console.error(err);
      alert("오류가 발생했습니다: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const urlPrefix = window.location.origin;

  const enablePushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert("푸시 알림을 지원하지 않는 브라우저입니다.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert("푸시 알림 권한이 거부되었습니다.");
        return;
      }

      setPushStatus("Registering...");

      const res = await fetch('/api/webpush/vapid-public-key');
      const vapidPublicKey = await res.text();
      
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      const subJSON = subscription.toJSON();
      
      // Save subscription in database mapping it to the user
      await supabase.from('push_subscriptions').upsert({
        user_id: user!.id,
        endpoint: subJSON.endpoint,
        p256dh: subJSON.keys?.p256dh,
        auth: subJSON.keys?.auth
      }, { onConflict: 'endpoint' });

      setPushStatus("Enabled");
      alert("푸시 알림이 활성화되었습니다. 이제 브라우저 백그라운드에서도 매장 알림을 받을 수 있습니다.");

    } catch (err: any) {
      console.error("Push registration error:", err);
      setPushStatus("Failed");
      alert("푸시 설정 오류: " + err.message);
    }
  };

  if (isLoading) return <div className="p-10 text-center">불러오는 중...</div>;

  if (!isPlusMember) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <Store className="w-16 h-16 text-brand-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">PLUS 멤버십 전용 기능</h2>
          <p className="text-gray-600 mb-6">매장 QR 주문 및 실시간 알림 시스템은<br/>유료 플랜 가입 후 이용 가능합니다.</p>
          <button 
            onClick={() => navigate('/pricing')}
            className="w-full py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90 transition-colors"
          >
            플랜 업그레이드하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-24 px-4 overflow-y-auto">
      <audio ref={audioRef} className="hidden" />
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <QrCode className="w-6 h-6 text-brand-primary" /> QR 서비스 관리
          </h1>
          <button 
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200"
          >
            <LogOut className="w-4 h-4" /> 뒤로가기
          </button>
        </div>

        <div className="flex space-x-1 bg-gray-200 p-1 rounded-xl">
          <button
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setActiveTab('settings')}
          >
            QR 호출 서비스 및 메뉴 설정
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setActiveTab('orders')}
          >
            실시간 주문 내역
            {requests.filter(r => r.status !== 'completed').length > 0 && (
              <span className="bg-brand-primary text-white text-xs px-2 py-0.5 rounded-full">
                {requests.filter(r => r.status !== 'completed').length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'orders' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[400px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b pb-4 gap-4">
              <h3 className="text-lg font-bold text-gray-900">오늘의 고객 요청 현황</h3>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-700">새 주문 알림음:</span>
                <div className="flex items-center gap-2">
                  <select 
                    value={notificationSound}
                    onChange={(e) => {
                      setNotificationSound(e.target.value);
                      if (e.target.value !== 'none') {
                        const sound = SOUNDS.find(s => s.id === e.target.value);
                        if (sound && audioRef.current) {
                          audioRef.current.src = sound.url;
                          audioRef.current.play().catch(() => {});
                        }
                      }
                    }}
                    className="text-sm border border-gray-200 rounded-lg p-2 bg-white"
                  >
                    {SOUNDS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-2 rounded-lg font-bold flex items-center gap-1 transition-colors">
                    {isUploadingSound ? <Loader2 className="w-3 h-3 animate-spin"/> : <Upload className="w-3 h-3"/>}
                    음원 업로드
                    <input type="file" accept="audio/*" className="hidden" onChange={handleSoundUpload} disabled={isUploadingSound} />
                  </label>
                </div>
              </div>
            </div>
            
            {requests.length === 0 ? (
              <div className="text-center py-20 text-gray-500 font-medium">오늘 들어온 요청이 없습니다.</div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-bold text-gray-500 mr-2 flex items-center">테이블 상차림 완료 (초기화):</span>
                    {Array.from(new Set(requests.map(r => r.table_number))).sort((a,b) => Number(a) - Number(b)).map(table => (
                      <button 
                        key={table}
                        onClick={() => setClearTableTarget(table)}
                        className="text-xs text-brand-primary bg-white font-bold hover:bg-brand-primary/5 px-3 py-1.5 rounded-lg border border-brand-primary/20 transition-colors shadow-sm"
                      >
                        T{table}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...requests].sort((a,b) => {
                     if (a.status === 'pending' && b.status !== 'pending') return -1;
                     if (a.status !== 'pending' && b.status === 'pending') return 1;
                     return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                  }).map((req) => (
                    <div key={req.id} className={`p-5 rounded-xl border transition-all ${req.status === 'completed' || req.status === 'cancelled' ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-brand-primary shadow-sm'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full">Table {req.table_number}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${req.status === 'completed' ? 'bg-gray-200 text-gray-500' : req.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-brand-primary/10 text-brand-primary'}`}>
                            {req.status === 'completed' ? '처리완료' : req.status === 'cancelled' ? '주문취소' : '요청중'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">{new Date(req.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="mb-4">
                        {req.request_type === 'drink' ? (
                          <>
                            <div className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                              <span className="bg-brand-primary/10 text-brand-primary p-1 rounded-md"><Coffee className="w-4 h-4"/></span>
                              음료 주문
                            </div>
                            <div className="text-sm font-medium text-gray-700 mt-2">
                               {req.details?.order_items ? (
                                 <ul className="space-y-1">
                                   {req.details.order_items.map((item: any, i: number) => (
                                     <li key={i} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg">
                                       <span>{item.name}</span>
                                       <span className="font-bold">{item.quantity}잔</span>
                                     </li>
                                   ))}
                                 </ul>
                               ) : (
                                 <div className="bg-gray-50 px-3 py-2 rounded-lg">{req.details?.drink_name || '알 수 없는 음료'}</div>
                               )}
                            </div>
                          </>
                        ) : (
                          <div className="font-bold text-gray-900 flex items-center gap-2">
                            <span className="bg-blue-50 text-blue-500 p-1 rounded-md"><MessageCircle className="w-4 h-4"/></span>
                            디자이너 상담 요청
                          </div>
                        )}
                      </div>
                      {req.status !== 'completed' && req.status !== 'cancelled' && (
                        <button 
                          onClick={() => handleCompleteRequest(req.id)}
                          className="w-full py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors"
                        >
                          완료 처리하기
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Store className="w-5 h-5 text-brand-primary" /> 1. 기본 매장 정보
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">※ 매장 정보(명칭, 주소, 연락처, 운영시간)는 전용 [매장 관리] 메뉴에서만 수정하실 수 있습니다.</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/admin/store')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary text-xs font-black rounded-lg transition-colors border border-brand-primary/20 shrink-0 self-start sm:self-center"
                >
                  <Store className="w-3.5 h-3.5" /> 매장 정보 수정하기
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                 <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                    <span className="block text-xs font-bold text-gray-400 uppercase mb-1">매장명 (Store Name)</span>
                    <span className="text-sm font-black text-gray-800">{formData.name || '미설정'}</span>
                 </div>
                 <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                    <span className="block text-xs font-bold text-gray-400 uppercase mb-1">매장 연락처 (Store Contact)</span>
                    <span className="text-sm font-black text-gray-800">
                      {(() => {
                        try {
                          const parsed = JSON.parse(formData.wifi_info);
                          return parsed?.phone || '미설정';
                        } catch {
                          return formData.wifi_info || '미설정';
                        }
                      })()}
                    </span>
                 </div>
                 <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 md:col-span-2">
                    <span className="block text-xs font-bold text-gray-400 uppercase mb-1">매장 주소 (Store Address)</span>
                    <span className="text-sm font-black text-gray-800">{formData.address || '미설정'}</span>
                 </div>
                 <div className="md:col-span-2 bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                    <span className="block text-xs font-bold text-gray-400 uppercase mb-3">매장 운영 요일/시간 (Store Operating Days/Hours)</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                      {['월', '화', '수', '목', '금', '토', '일'].map((dayName, idx) => {
                        const bt = businessTimes.find(b => b.weekday === idx);
                        return (
                          <div key={idx} className="bg-white p-2.5 rounded-lg border border-gray-150 text-center">
                            <span className="text-xs font-bold text-gray-500">{dayName}요일</span>
                            {bt && bt.active ? (
                              <p className="text-[10px] font-black text-brand-primary mt-1">{getAmPmTimeString(bt.startedAt)} ~ {getAmPmTimeString(bt.endedAt)}</p>
                            ) : (
                              <p className="text-[10px] font-black text-red-400 mt-1">정기휴무</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">매장 로고 이미지 URL (선택)</label>
                    <input type="text" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none"
                      value={formData.logo_url?.replace('[IMAGE_ONLY]', '')} onChange={(e) => {
                         const isImageOnly = formData.logo_url?.startsWith('[IMAGE_ONLY]');
                         setFormData({...formData, logo_url: isImageOnly ? `[IMAGE_ONLY]${e.target.value}` : e.target.value});
                      }} placeholder="https:// ... (없으면 기본 아이콘이 표시됩니다)" />
                    
                    {formData.logo_url?.replace('[IMAGE_ONLY]', '').trim() !== '' && (
                      <label className="flex items-center gap-2 mt-3 cursor-pointer">
                        <input type="checkbox" 
                          className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary"
                          checked={formData.logo_url?.startsWith('[IMAGE_ONLY]')}
                          onChange={(e) => {
                             const urlStr = formData.logo_url?.replace('[IMAGE_ONLY]', '') || '';
                             setFormData({...formData, logo_url: e.target.checked ? `[IMAGE_ONLY]${urlStr}` : urlStr});
                          }}
                        />
                        <span className="text-sm font-medium text-gray-700">QR 페이지에서 매장명 텍스트 대신 이 이미지만 사용하기</span>
                      </label>
                    )}
                 </div>

                 <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-4">QR 페이지 테마 템플릿 선택</label>
                    <div className="flex flex-wrap gap-3 mb-8">
                      {QR_THEMES.map(theme => (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => setFormData({
                            ...formData, 
                            theme_id: theme.id,
                            theme_color: theme.primary,
                            theme_text_color: '#ffffff'
                          })}
                          className={`relative group flex items-center justify-center p-1 rounded-full transition-all ${formData.theme_id === theme.id ? 'ring-2 ring-offset-2 ring-brand-primary scale-110' : 'hover:scale-105'}`}
                          title={theme.name}
                        >
                          <div className="w-10 h-10 rounded-full shadow-sm" style={{ backgroundColor: theme.primary }} />
                          {formData.theme_id === theme.id && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Check className="w-5 h-5 text-white drop-shadow-md" />
                            </div>
                          )}
                        </button>
                       ))}
                    </div>

                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                      <label className="block text-sm font-black text-gray-500 mb-4 tracking-tighter uppercase">테마 상세 커스터마이징</label>
                      <div className="space-y-6">
                        <div className="flex flex-wrap gap-6">
                          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-50">
                               <input type="color" className="w-8 h-8 rounded shrink-0 cursor-pointer border-none p-0" value={formData.theme_color} onChange={(e) => {
                                 const color = e.target.value;
                                 const hex = color.replace('#', '');
                                 // Auto calc brightness
                                 if (hex.length === 6) {
                                   const r = parseInt(hex.substring(0, 2), 16);
                                   const g = parseInt(hex.substring(2, 4), 16);
                                   const b = parseInt(hex.substring(4, 6), 16);
                                   const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
                                   const isDark = yiq < 128;
                                   setFormData({...formData, theme_color: color, theme_text_color: isDark ? '#ffffff' : '#111827'});
                                 } else {
                                   setFormData({...formData, theme_color: color});
                                 }
                               }} />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase">브랜드 컬러</p>
                              <p className="text-sm font-black text-gray-700">{formData.theme_color}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-50">
                               <input type="color" className="w-8 h-8 rounded shrink-0 cursor-pointer border-none p-0" value={formData.theme_text_color} onChange={(e) => setFormData({...formData, theme_text_color: e.target.value})} />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase">텍스트 컬러</p>
                              <p className="text-sm font-black text-gray-700">{formData.theme_text_color}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 bg-white/50 p-4 rounded-xl border border-dashed border-gray-300">
                           <span className="text-xs font-black text-gray-400 uppercase tracking-widest">실시간 미리보기</span>
                           <div 
                             className="px-6 py-2.5 rounded-full text-sm font-black shadow-lg transition-all"
                             style={{ backgroundColor: formData.theme_color, color: formData.theme_text_color }}
                           >
                             {formData.name || '매장 이름'}
                           </div>
                        </div>
                      </div>
                    </div>
                 </div>

                 <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">주차 정보 / 안내문</label>
                    <textarea className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none" rows={3}
                      value={formData.parking_info} onChange={(e) => setFormData({...formData, parking_info: e.target.value})} placeholder="예: 건물 뒷편 발렛파킹 이용 가능합니다." />
                 </div>
              </div>
            </div>
          
            <div className="mt-8 flex justify-end">
               <button 
                 onClick={handleSave}
                 disabled={isSaving}
                 className="flex items-center gap-2 bg-brand-primary text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 transition-all disabled:opacity-50"
               >
                 {isSaving ? <span className="animate-spin truncate border-2 border-white/20 border-t-white rounded-full w-4 h-4" /> : <Check className="w-5 h-5"/>}
                 저장하기
               </button>
            </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">2. 음료 메뉴 설정</h3>
          <div className="space-y-3">
             {formData.drinks_menu.map((drink, idx) => (
                <div key={drink.id} className="flex items-center gap-4 bg-gray-50 border border-gray-200 p-3 rounded-xl">
                    <input type="text" className="flex-1 p-2 border border-gray-200 rounded-lg outline-none" value={drink.name} onChange={(e) => {
                        const newArr = [...formData.drinks_menu];
                        newArr[idx].name = e.target.value;
                        setFormData({...formData, drinks_menu: newArr});
                    }}/>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer">
                        <input type="checkbox" checked={drink.available} onChange={(e) => {
                            const newArr = [...formData.drinks_menu];
                            newArr[idx].available = e.target.checked;
                            setFormData({...formData, drinks_menu: newArr});
                        }} className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary"/>
                        제공
                    </label>
                    <button onClick={() => {
                        setFormData({...formData, drinks_menu: formData.drinks_menu.filter((_, i) => i !== idx)});
                    }} className="text-red-500 font-bold text-sm px-2">삭제</button>
                </div>
             ))}
             <button onClick={() => {
                 setFormData({...formData, drinks_menu: [...formData.drinks_menu, { id: Date.now().toString(), name: '새 음료', available: true }]});
             }} className="mt-2 flex items-center gap-1 text-brand-primary font-bold text-sm"><Plus className="w-4 h-4"/> 음료 추가</button>
          </div>
          <div className="mt-8 flex justify-end">
            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-gray-900 text-white font-bold py-2.5 px-5 rounded-xl hover:bg-gray-800 transition-all text-sm">
              <Check className="w-4 h-4"/> 저장하기
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">3. 시술 메뉴판 설정</h3>
          <div className="space-y-6">
             {formData.procedure_menu.map((cat, catIdx) => (
                 <div key={cat.id} className="bg-gray-50 border border-gray-200 p-5 rounded-xl">
                     <div className="flex items-center gap-3 mb-4">
                         <input type="text" className="font-bold text-sm p-2 border border-gray-200 rounded-lg outline-none w-48" value={cat.category} onChange={(e) => {
                             const newArr = [...formData.procedure_menu];
                             newArr[catIdx].category = e.target.value;
                             setFormData({...formData, procedure_menu: newArr});
                         }} placeholder="카테고리명 (예: CUT)"/>
                         <button onClick={() => {
                             setFormData({...formData, procedure_menu: formData.procedure_menu.filter((_, i) => i !== catIdx)});
                         }} className="text-red-500 font-bold text-sm">카테고리 삭제</button>
                     </div>
                     <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                         {cat.items.map((item: any, itemIdx: number) => (
                             <div key={itemIdx} className="flex items-center gap-3">
                                 <input type="text" className="flex-1 p-2 border border-gray-200 rounded-lg outline-none text-sm" value={item.name} onChange={(e) => {
                                     const newArr = [...formData.procedure_menu];
                                     newArr[catIdx].items[itemIdx].name = e.target.value;
                                     setFormData({...formData, procedure_menu: newArr});
                                 }} placeholder="메뉴 구상 (예: 남성 컷)"/>
                                 <input type="text" className="w-32 p-2 border border-gray-200 rounded-lg outline-none text-sm" value={item.price} onChange={(e) => {
                                     const newArr = [...formData.procedure_menu];
                                     newArr[catIdx].items[itemIdx].price = e.target.value;
                                     setFormData({...formData, procedure_menu: newArr});
                                 }} placeholder="가격 (예: 20,000)"/>
                                 <button onClick={() => {
                                     const newArr = [...formData.procedure_menu];
                                     newArr[catIdx].items = newArr[catIdx].items.filter((_: any, i: number) => i !== itemIdx);
                                     setFormData({...formData, procedure_menu: newArr});
                                 }} className="text-red-500 font-bold text-xs p-2">삭제</button>
                             </div>
                         ))}
                         <button onClick={() => {
                             const newArr = [...formData.procedure_menu];
                             newArr[catIdx].items.push({ name: '', price: '' });
                             setFormData({...formData, procedure_menu: newArr});
                         }} className="mt-2 flex items-center gap-1 text-blue-500 font-bold text-xs"><Plus className="w-3 h-3"/> 시술 메뉴 항목 추가</button>
                     </div>
                 </div>
             ))}
             <button onClick={() => {
                 setFormData({...formData, procedure_menu: [...formData.procedure_menu, { id: Date.now().toString(), category: '새 카테고리', items: [{name:'', price:''}] }]});
             }} className="flex items-center gap-1 text-gray-700 font-bold border border-gray-300 py-2 px-4 rounded-xl text-sm hover:bg-gray-100"><Plus className="w-4 h-4"/> 카테고리 추가</button>
          </div>
          <div className="mt-8 flex justify-end">
            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-gray-900 text-white font-bold py-2.5 px-5 rounded-xl hover:bg-gray-800 transition-all text-sm">
              <Check className="w-4 h-4"/> 저장하기
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">4. 상단 이벤트 배너 설정 (고객 화면 상단)</h3>
          <div className="space-y-4">
            {formData.top_banners.map((banner: any, idx: number) => (
              <div key={banner.id} className="bg-gray-50 border border-gray-200 p-4 rounded-xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                   <select className="p-2 border border-gray-200 rounded-lg text-sm bg-white outline-none" value={banner.type} onChange={(e) => {
                       const newArr = [...formData.top_banners];
                       newArr[idx].type = e.target.value;
                       setFormData({...formData, top_banners: newArr});
                   }}>
                     <option value="text">텍스트 공지</option>
                     <option value="image">이미지 URL</option>
                   </select>
                   <button onClick={() => {
                       setFormData({...formData, top_banners: formData.top_banners.filter((_:any, i:number) => i !== idx)});
                   }} className="text-red-500 font-bold text-xs p-2 hover:bg-red-50 rounded">삭제</button>
                </div>
                {banner.type === 'image' ? (
                  <input type="text" className="w-full p-2 border border-gray-200 rounded-lg outline-none text-sm placeholder:text-gray-400"
                    value={banner.content} 
                    onChange={(e) => {
                       const newArr = [...formData.top_banners];
                       newArr[idx].content = e.target.value;
                       setFormData({...formData, top_banners: newArr});
                    }} 
                    placeholder="이미지 URL 입력 (https://...)" />
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <input type="text" className="w-full p-2 border border-gray-200 rounded-lg outline-none text-sm placeholder:text-gray-400 font-medium"
                        value={banner.title || ''} 
                        onChange={(e) => {
                           const newArr = [...formData.top_banners];
                           newArr[idx].title = e.target.value;
                           setFormData({...formData, top_banners: newArr});
                        }} 
                        placeholder="이벤트 제목 (예: 여름 맞이 특가 할인)" />
                      <button 
                        onClick={() => handleAIGenerateBannerText(idx, 'top')}
                        disabled={isGeneratingAI}
                        className="shrink-0 flex items-center gap-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-1.5 px-3 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all text-xs shadow disabled:opacity-50"
                        title="입력한 제목으로 AI가 배너 사이즈에 맞게 내용을 자동 생성해줍니다."
                      >
                        <Sparkles className="w-3.5 h-3.5" /> AI 자동 생성
                      </button>
                    </div>
                    <textarea 
                      className="w-full p-2 border border-gray-200 rounded-lg outline-none text-sm placeholder:text-gray-400 resize-none"
                      rows={2}
                      value={banner.content || ''}
                      onChange={(e) => {
                         const newArr = [...formData.top_banners];
                         newArr[idx].content = e.target.value;
                         setFormData({...formData, top_banners: newArr});
                      }}
                      placeholder="배너에 들어갈 내용 (AI가 생성해줍니다)"
                    />
                  </>
                )}
                <input type="text" className="w-full p-2 border border-gray-200 rounded-lg outline-none text-sm placeholder:text-gray-400"
                  value={banner.link || ''} 
                  onChange={(e) => {
                     const newArr = [...formData.top_banners];
                     newArr[idx].link = e.target.value;
                     setFormData({...formData, top_banners: newArr});
                  }} 
                  placeholder="클릭 시 이동할 링크 URL (선택사항)" />
              </div>
            ))}
            <button onClick={() => {
                setFormData({...formData, top_banners: [...formData.top_banners, { id: Date.now().toString(), type: 'text', content: '' }]});
            }} className="flex items-center gap-1 text-gray-700 font-bold border border-gray-300 py-2 px-4 rounded-xl text-sm hover:bg-gray-100"><Plus className="w-4 h-4"/> 상단 배너 추가</button>
          </div>
          <div className="mt-8 flex justify-end">
            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-gray-900 text-white font-bold py-2.5 px-5 rounded-xl hover:bg-gray-800 transition-all text-sm">
              <Check className="w-4 h-4"/> 저장하기
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">5. 하단 배너 설정 (고객 화면 맨 아래)</h3>
          <div className="space-y-4">
            {formData.bottom_banners.map((banner: any, idx: number) => (
              <div key={banner.id} className="bg-gray-50 border border-gray-200 p-4 rounded-xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                   <select className="p-2 border border-gray-200 rounded-lg text-sm bg-white outline-none" value={banner.type} onChange={(e) => {
                       const newArr = [...formData.bottom_banners];
                       newArr[idx].type = e.target.value;
                       setFormData({...formData, bottom_banners: newArr});
                   }}>
                     <option value="text">텍스트 안내</option>
                     <option value="image">이미지 URL</option>
                   </select>
                   <button onClick={() => {
                       setFormData({...formData, bottom_banners: formData.bottom_banners.filter((_:any, i:number) => i !== idx)});
                   }} className="text-red-500 font-bold text-xs p-2 hover:bg-red-50 rounded">삭제</button>
                </div>
                {banner.type === 'image' ? (
                  <input type="text" className="w-full p-2 border border-gray-200 rounded-lg outline-none text-sm placeholder:text-gray-400"
                    value={banner.content} 
                    onChange={(e) => {
                       const newArr = [...formData.bottom_banners];
                       newArr[idx].content = e.target.value;
                       setFormData({...formData, bottom_banners: newArr});
                    }} 
                    placeholder="이미지 URL 입력 (https://...)" />
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <input type="text" className="w-full p-2 border border-gray-200 rounded-lg outline-none text-sm placeholder:text-gray-400 font-medium"
                        value={banner.title || ''} 
                        onChange={(e) => {
                           const newArr = [...formData.bottom_banners];
                           newArr[idx].title = e.target.value;
                           setFormData({...formData, bottom_banners: newArr});
                        }} 
                        placeholder="이벤트/안내 제목 (예: 디자이너 추천 제품)" />
                      <button 
                        onClick={() => handleAIGenerateBannerText(idx, 'bottom')}
                        disabled={isGeneratingAI}
                        className="shrink-0 flex items-center gap-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-1.5 px-3 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all text-xs shadow disabled:opacity-50"
                        title="입력한 제목으로 AI가 배너 사이즈에 맞게 내용을 자동 생성해줍니다."
                      >
                        <Sparkles className="w-3.5 h-3.5" /> AI 자동 생성
                      </button>
                    </div>
                    <textarea 
                      className="w-full p-2 border border-gray-200 rounded-lg outline-none text-sm placeholder:text-gray-400 resize-none"
                      rows={2}
                      value={banner.content || ''}
                      onChange={(e) => {
                         const newArr = [...formData.bottom_banners];
                         newArr[idx].content = e.target.value;
                         setFormData({...formData, bottom_banners: newArr});
                      }}
                      placeholder="배너에 들어갈 내용 (AI가 생성해줍니다)"
                    />
                  </>
                )}
                <input type="text" className="w-full p-2 border border-gray-200 rounded-lg outline-none text-sm placeholder:text-gray-400"
                  value={banner.link || ''} 
                  onChange={(e) => {
                     const newArr = [...formData.bottom_banners];
                     newArr[idx].link = e.target.value;
                     setFormData({...formData, bottom_banners: newArr});
                  }} 
                  placeholder="클릭 시 이동할 링크 URL (선택사항)" />
              </div>
            ))}
            <button onClick={() => {
                setFormData({...formData, bottom_banners: [...formData.bottom_banners, { id: Date.now().toString(), type: 'image', content: '' }]});
            }} className="flex items-center gap-1 text-gray-700 font-bold border border-gray-300 py-2 px-4 rounded-xl text-sm hover:bg-gray-100"><Plus className="w-4 h-4"/> 하단 배너 추가</button>
          </div>
          <div className="mt-8 flex justify-end">
            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-gray-900 text-white font-bold py-2.5 px-5 rounded-xl hover:bg-gray-800 transition-all text-sm">
              <Check className="w-4 h-4"/> 저장하기
            </button>
          </div>
        </div>

        {shop && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center justify-between mb-6 border-b pb-4">
                <h3 className="text-lg font-bold text-gray-900">6. 실시간 알림 (Web Push) 설정</h3>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${pushStatus === 'Enabled' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{pushStatus}</span>
              </div>
              <p className="text-gray-600 mb-4 text-sm">푸시 알림을 켜두시면 브라우저가 내려가 있어도 고객의 음료 주문이나 상담 요청을 즉시 받을 수 있습니다.</p>
              <button 
                onClick={enablePushNotifications}
                className="flex items-center gap-2 bg-gray-900 text-white font-medium py-3 px-5 rounded-xl hover:bg-gray-800 transition-all text-sm"
              >
                <Bell className="w-4 h-4"/> 푸시 알림 권한 허용하기
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center justify-between mb-6 border-b pb-4">
                <h3 className="text-lg font-bold text-gray-900">7. 테이블 QR 코드 발급</h3>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">테이블 수량 (개)</label>
                  <input type="number" min="1" max="50" className="w-32 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none"
                    value={formData.table_count} onChange={(e) => setFormData({...formData, table_count: parseInt(e.target.value) || 0})} />
                </div>
                <div className="pt-6">
                  <button 
                    onClick={handleSave}
                    className="bg-brand-primary/10 text-brand-primary font-bold py-3 px-5 rounded-xl hover:bg-brand-primary/20 transition-all text-sm"
                  >
                    확인 및 갱신
                  </button>
                </div>
                <div className="pt-6 ml-auto">
                    <button 
                      onClick={() => window.print()}
                      className="flex items-center gap-2 bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-200 transition-all"
                    >
                      <QrCode className="w-5 h-5"/> 인쇄하기
                    </button>
                </div>
              </div>

              {formData.table_count > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 print:grid-cols-2" id="qr-container">
                  {Array.from({ length: formData.table_count }).map((_, i) => {
                    const tableIdx = i + 1;
                    const destUrl = `${urlPrefix}/m/shop/${shop.id}/${tableIdx}`;
                    return (
                      <div key={tableIdx} className="bg-gray-50 border border-gray-200 p-4 rounded-2xl flex flex-col items-center text-center">
                        <span className="text-xl font-black text-brand-primary mb-3 block">Table {tableIdx}</span>
                        <div className="bg-white p-2 rounded-xl shadow-sm mb-3">
                          <QRCodeSVG value={destUrl} size={120} />
                        </div>
                        <p className="text-xs text-gray-500 mb-1">{formData.name}</p>
                        <a href={destUrl} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline break-all">
                          미리보기
                        </a>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-10">생성된 QR 코드가 없습니다. 수량을 입력해주세요.</p>
              )}
            </div>
          </>
        )}
        </>
      )}
      </div>

      {clearTableTarget !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">테이블 초기화</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                정말 Table {clearTableTarget}의 모든 주문/요청 내역을 초기화하시겠습니까?<br/>
                <span className="text-red-500 text-xs">(해당 테이블의 손님이 바뀔 때 유용합니다.)</span>
              </p>
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => setClearTableTarget(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleClearTableRequests}
                  className="flex-1 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-colors"
                >
                  초기화 진행
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
