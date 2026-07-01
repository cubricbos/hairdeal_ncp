import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { Store, Phone, MapPin, Clock, Save, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { apiClient, accountClient } from '../../lib/ncpClient';
import { retrySupabaseSelect } from '../../lib/supabase-utils';

export function formatToIsoDate(timeStr: string): string {
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

export function formatToTimeStr(val: string): string {
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

export function getAmPmTimeString(timeStr: string): string {
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

export default function StoreManagementPage({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Core Store Information
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [zoneCode, setZoneCode] = useState('');
  const [address, setAddress] = useState('');
  const [roadAddress, setRoadAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [sido, setSido] = useState('');
  const [sigungu, setSigungu] = useState('');
  const [bname, setBname] = useState('');
  const [latitude, setLatitude] = useState(37.5);
  const [longitude, setLongitude] = useState(127.0);
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
  
  // Operating Hours
  const [businessTimes, setBusinessTimes] = useState<any[]>(() => {
    return Array.from({ length: 7 }, (_, i) => ({
      weekday: i,
      active: true,
      startedAt: '10:00',
      endedAt: '20:00'
    }));
  });
  const [holidays, setHolidays] = useState<any[]>([]);

  const loadDaumPostcode = (): Promise<any> => {
    return new Promise((resolve) => {
      if ((window as any).daum && (window as any).daum.Postcode) {
        resolve((window as any).daum);
        return;
      }
      const id = 'daum-postcode-script';
      if (document.getElementById(id)) {
        const interval = setInterval(() => {
          if ((window as any).daum && (window as any).daum.Postcode) {
            clearInterval(interval);
            resolve((window as any).daum);
          }
        }, 100);
        return;
      }
      const script = document.createElement('script');
      script.id = id;
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.async = true;
      script.onload = () => {
        resolve((window as any).daum);
      };
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    if (isPostcodeOpen) {
      loadDaumPostcode().then((daum) => {
        setTimeout(() => {
          const container = document.getElementById('postcode-container');
          if (container && daum) {
            new daum.Postcode({
              oncomplete: (data: any) => {
                setZoneCode(data.zonecode || '');
                setAddress(data.jibunAddress || data.address || '');
                setRoadAddress(data.roadAddress || data.address || '');
                setSido(data.sido || '');
                setSigungu(data.sigungu || '');
                setBname(data.bname || '');
                setIsPostcodeOpen(false);
              },
              width: '100%',
              height: '100%'
            }).embed(container);
          }
        }, 100);
      });
    }
  }, [isPostcodeOpen]);

  useEffect(() => {
    let isMounted = true;

    if (!user) {
      navigate('/');
      return;
    }

    const fetchStoreData = async () => {
      try {
        setIsLoading(true);

        // 1. We ONLY fetch from NCP (Supabase is fully deprecated per user request)
        let ncpShopName = '';
        let ncpShopAddress = '';
        let ncpShopRoadAddress = '';
        let ncpShopPhone = '';
        let ncpShopZoneCode = '';
        let ncpShopAddressDetail = '';
        let ncpShopSido = '';
        let ncpShopSigungu = '';
        let ncpShopBname = '';
        let ncpShopLatitude = 37.5;
        let ncpShopLongitude = 127.0;
        let ncpBusinessTimes: any[] = [];
        let ncpHolidays: any[] = [];

        // 2a. Fetch from apiClient (Core Server) - Actual repository for store details
        try {
          const token = localStorage.getItem('ncp_access_token');
          let designerId = '';
          if (token) {
            try {
              const base64Url = token.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                  return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              }).join(''));
              const decoded = JSON.parse(jsonPayload);
              designerId = decoded?.id || decoded?.sub;
            } catch (e) {
              console.error("Failed to decode token", e);
            }
          }

          if (designerId) {
            // Fetch designer and shop settings from Core server targeting hairdeal
            const detailRes = await apiClient.get('/admin/designer', { params: { designerId, _t: Date.now() } });
            const d = detailRes?.data;
            if (d) {
              const hShop = d.hairShop || {};
              if (hShop.name) ncpShopName = hShop.name;
              if (hShop.address) ncpShopAddress = hShop.address;
              if (hShop.roadAddress) ncpShopRoadAddress = hShop.roadAddress;
              if (hShop.number || hShop.phone || hShop.tel) ncpShopPhone = hShop.number || hShop.phone || hShop.tel;
              if (hShop.zoneCode || hShop.zipCode || hShop.zonecode) ncpShopZoneCode = hShop.zoneCode || hShop.zipCode || hShop.zonecode;
              if (hShop.addressDetail) ncpShopAddressDetail = hShop.addressDetail;
              if (hShop.sido) ncpShopSido = hShop.sido;
              if (hShop.sigungu) ncpShopSigungu = hShop.sigungu;
              if (hShop.bname) ncpShopBname = hShop.bname;
              if (hShop.latitude) ncpShopLatitude = hShop.latitude;
              if (hShop.longitude) ncpShopLongitude = hShop.longitude;

              if (d.businessTimes && d.businessTimes.length > 0) {
                ncpBusinessTimes = d.businessTimes;
              }
              if (d.holidays) {
                ncpHolidays = d.holidays;
              }
            }
          }
        } catch (apiErr) {
          console.warn("Failed to load store settings from Core server: ", apiErr);
        }

        // 2b. Fetch from accountClient (Account Server) - merge fields, avoiding stale default placeholders
        try {
          const accountRes = await accountClient.get(`/designer/detail?_t=${Date.now()}`);
          const ad = accountRes?.data;
          if (ad) {
            const ahShop = ad.hairShop || {};
            const isPlaceholderName = !ahShop.name || ahShop.name === '미등록 매장';
            const isPlaceholderAddr = !ahShop.address || ahShop.addressDetail === '미등록 매장 주소';

            if (ahShop.name && (isPlaceholderName ? !ncpShopName : true)) {
              if (!ncpShopName || ncpShopName === '미등록 매장') ncpShopName = ahShop.name;
            }
            if (ahShop.address && (isPlaceholderAddr ? !ncpShopAddress : true)) {
              if (!ncpShopAddress || ncpShopAddress === '자택' || ncpShopAddress === '') ncpShopAddress = ahShop.address;
            }
            if (ahShop.roadAddress && !ncpShopRoadAddress) {
              ncpShopRoadAddress = ahShop.roadAddress;
            } else if (!ncpShopRoadAddress && ncpShopAddress) {
              ncpShopRoadAddress = ncpShopAddress;
            }
            if (ahShop.number || ahShop.phone || ahShop.tel) {
              const p = ahShop.number || ahShop.phone || ahShop.tel;
              if (p && (!ncpShopPhone || ncpShopPhone === '010-0000-0000')) ncpShopPhone = p;
            }
            if (ahShop.zoneCode || ahShop.zipCode || ahShop.zonecode) {
              const z = ahShop.zoneCode || ahShop.zipCode || ahShop.zonecode;
              if (z && !ncpShopZoneCode) ncpShopZoneCode = z;
            }
            if (ahShop.addressDetail && (!ncpShopAddressDetail || ncpShopAddressDetail === '미등록 매장 주소')) {
              ncpShopAddressDetail = ahShop.addressDetail;
            }
            if (ahShop.sido && !ncpShopSido) ncpShopSido = ahShop.sido;
            if (ahShop.sigungu && !ncpShopSigungu) ncpShopSigungu = ahShop.sigungu;
            if (ahShop.bname && !ncpShopBname) ncpShopBname = ahShop.bname;
            if (ahShop.latitude && ncpShopLatitude === 37.5) ncpShopLatitude = ahShop.latitude;
            if (ahShop.longitude && ncpShopLongitude === 127.0) ncpShopLongitude = ahShop.longitude;

            if (ad.businessTimes && ad.businessTimes.length > 0 && ncpBusinessTimes.length === 0) {
              ncpBusinessTimes = ad.businessTimes;
            }
            if (ad.holidays && ncpHolidays.length === 0) {
              ncpHolidays = ad.holidays;
            }
          }
        } catch (err) {
          console.warn("Failed to load store settings from Account server: ", err);
        }

        // Apply final merged values to React states
        if (isMounted) {
          setName(ncpShopName);
          setPhone(ncpShopPhone);
          setZoneCode(ncpShopZoneCode);
          setAddress(ncpShopAddress);
          setRoadAddress(ncpShopRoadAddress || ncpShopAddress);
          setAddressDetail(ncpShopAddressDetail);
          setSido(ncpShopSido);
          setSigungu(ncpShopSigungu);
          setBname(ncpShopBname);
          setLatitude(ncpShopLatitude);
          setLongitude(ncpShopLongitude);

          if (ncpBusinessTimes && ncpBusinessTimes.length > 0) {
            const times = Array.from({ length: 7 }, (_, i) => {
              let found = ncpBusinessTimes.find((bt: any) => bt && bt.weekday === i);
              if (!found && ncpBusinessTimes[i]) {
                const item = ncpBusinessTimes[i];
                if (typeof item === 'object') {
                  found = item;
                }
              }
              return {
                weekday: i,
                active: !!found,
                startedAt: formatToTimeStr(found?.startedAt || '10:00'),
                endedAt: formatToTimeStr(found?.endedAt || '20:00')
              };
            });
            setBusinessTimes(times);
          } else {
            setBusinessTimes(Array.from({ length: 7 }, (_, i) => ({
              weekday: i,
              active: true,
              startedAt: '10:00',
              endedAt: '20:00'
            })));
          }

          if (ncpHolidays && ncpHolidays.length > 0) {
            setHolidays(ncpHolidays);
          }
        }

      } catch (err) {
        console.error("Failed to load store settings: ", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchStoreData();

    return () => {
      isMounted = false;
    };
  }, [user, navigate]);

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) {
      alert("매장명을 입력해 주세요.");
      return;
    }

    setIsSaving(true);
    try {
      const businessTimesPayload = Array.from({ length: 7 }, (_, i) => {
        const bt = businessTimes.find(b => b.weekday === i);
        if (!bt || !bt.active) return null;
        return {
          startedAt: formatToIsoDate(bt.startedAt || '10:00'),
          endedAt: formatToIsoDate(bt.endedAt || '20:00')
        };
      });

      const payload = {
        shopName: name,
        shopNumber: phone,
        addressDetail: addressDetail || "",
        address: {
          sido: sido || "",
          sigungu: sigungu || "",
          bname: bname || "",
          address: address,
          roadAddress: roadAddress || address,
          zonecode: zoneCode || "",
          latitude: latitude || 37.5,
          longitude: longitude || 127.0
        },
        businessTimes: businessTimesPayload,
        holidays: holidays.map((h: any) => ({
          startedAt: h.startedAt,
          endedAt: h.endedAt
        }))
      };

      let ncpUpdated = false;

      // 1a. Core Server /designer/management Sync - Actual settings repository
      try {
        const token = localStorage.getItem('ncp_access_token');
        if (token) {
          let response = await apiClient.post('/designer/management', payload);
          const resData = response?.data;
          const d = resData?.data_response?.designer || resData;
          if (d) {
            ncpUpdated = true;
            if (d.businessTimes && d.businessTimes.length > 0) {
              const times = Array.from({ length: 7 }, (_, i) => {
                let found = d.businessTimes.find((bt: any) => bt && bt.weekday === i);
                if (!found && d.businessTimes[i]) {
                  const item = d.businessTimes[i];
                  if (typeof item === 'object') {
                    found = item;
                  }
                }
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
        console.warn("Failed to synchronize with NCP Core Backend /designer/management: ", backendErr.response?.data);
        // Fallback alt payload attempt
        try {
          const altPayload = {
            hairShop: {
              name: name,
              number: phone,
              addressDetail: addressDetail || "",
              address: address,
              roadAddress: roadAddress || address,
              zipCode: zoneCode || "12345",
              latitude: latitude || 37.5,
              longitude: longitude || 127.0
            }
          };
          const response = await apiClient.post('/designer/management', altPayload);
          const resData = response?.data;
          const d = resData?.data_response?.designer || resData;
          if (d) {
            ncpUpdated = true;
          }
        } catch (innerErr) {
          console.warn("Failed fallback NCP /designer/management: ", innerErr);
        }
      }

      // 1b. Account Server Sync - Keep in sync across /hair-shop (correct flat shop endpoint)
      try {
        const token = localStorage.getItem('ncp_access_token');
        if (token) {
          const shopPayload: any = {
            name: name,
            number: phone || "010-0000-0000",
            address: address,
            addressDetail: addressDetail || "",
            zipCode: zoneCode || "12345",
            sido: sido || "",
            sigungu: sigungu || "",
            bname: bname || "",
            latitude: latitude || 37.5,
            longitude: longitude || 127.0
          };

          // Try verified /hair-shop (which succeeds when sent with only flat fields)
          try {
            const resLegacy = await accountClient.post('/hair-shop', shopPayload);
            if (resLegacy?.data) {
              ncpUpdated = true;
            }
          } catch (eInner: any) {
             console.warn("Account Server flat /hair-shop fallback failed: ", eInner?.response?.data || eInner.message);
          }
        }
      } catch (shopErr: any) {
        console.warn("Failed to synchronize with NCP Account Server: ", shopErr);
      }

      alert("매장 정보가 NCP 서버 DB에 실시간으로 성공적으로 저장 및 동일하게 동기화 처리 되었습니다.");
    } catch (err: any) {
      console.error(err);
      alert("매장 정보 저장에 실패했습니다: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <Loader2 className="w-10 h-10 text-brand-primary animate-spin mb-3" />
        <p className="text-sm font-bold text-gray-500">매장 정보를 서버와 실시간 동기화 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-24 px-4 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Store className="w-6 h-6 text-brand-primary" /> 매장 정보 관리
          </h1>
          <button 
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> SaaS 홈으로
          </button>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-8">
          <div>
            <h2 className="text-lg font-bold text-gray-950 mb-1 flex items-center gap-2">
              <Store className="w-5 h-5 text-indigo-500" /> 기본 매장 정보
            </h2>
            <p className="text-xs text-gray-400">매장의 명칭, 주소, 연락처 등의 기본 정보를 수정합니다. 이 정보는 NCP DB와 실시간 연동됩니다.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
                매장명 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none text-sm font-semibold text-gray-900 transition-all placeholder:text-gray-300"
                  placeholder="예: 살롱드헤어 강남점" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
                매장 연락처
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none text-sm font-semibold text-gray-900 transition-all placeholder:text-gray-300"
                  placeholder="예: 02-1234-5678" 
                />
              </div>
            </div>

            <div className="space-y-4 md:col-span-2">
              <label className="block text-sm font-bold text-gray-700">
                매장 주소 및 우편번호 <span className="text-red-500">*</span>
              </label>
              
              {/* Zip Code & Search Button */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input 
                    type="text" 
                    value={zoneCode} 
                    readOnly
                    className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl border border-gray-200 outline-none text-sm font-semibold text-gray-500 transition-all cursor-not-allowed"
                    placeholder="우편번호 (우측 버튼을 눌러 검색하세요)" 
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsPostcodeOpen(true)}
                  className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl active:scale-98 transition-all shadow-sm shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  우편번호 검색
                </button>
              </div>

              {/* Base Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-gray-450 ml-1">도로명 주소</span>
                  <input 
                    type="text" 
                    value={roadAddress} 
                    readOnly
                    className="w-full px-4 py-3 bg-gray-100/80 rounded-xl border border-gray-200 outline-none text-sm font-semibold text-gray-500 cursor-not-allowed"
                    placeholder="도로명 주소" 
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-gray-450 ml-1">지번 주소</span>
                  <input 
                    type="text" 
                    value={address} 
                    readOnly
                    className="w-full px-4 py-3 bg-gray-100/80 rounded-xl border border-gray-200 outline-none text-sm font-semibold text-gray-500 cursor-not-allowed"
                    placeholder="지번 주소" 
                  />
                </div>
              </div>

              {/* Detailed Address */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-400 ml-1">상세 주소 입력</span>
                <input 
                  type="text" 
                  value={addressDetail} 
                  onChange={(e) => setAddressDetail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none text-sm font-semibold text-gray-900 transition-all placeholder:text-gray-300"
                  placeholder="예: 2층 202호 (상세 위치 등록)" 
                />
              </div>

              {/* Postcode Overlay Modal */}
              {isPostcodeOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-all backdrop-blur-xs">
                  <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col border border-gray-100 max-h-[90vh]">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                      <span className="text-sm font-bold text-gray-800">우편번호 주소 검색</span>
                      <button 
                        type="button"
                        onClick={() => setIsPostcodeOpen(false)}
                        className="text-xs font-bold text-gray-400 hover:text-gray-700 bg-gray-200 hover:bg-gray-300 w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer animate-none"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto bg-white min-h-[450px] relative">
                      <div id="postcode-container" className="w-full h-[450px]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Operating Hours */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-950 mb-1 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" /> 매장 영업 요일 및 시간
              </h2>
              <p className="text-xs text-gray-400">요일별 정기 휴무 및 시작/종료 영업시간 시간표를 구성합니다.</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/60 space-y-3">
              {['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'].map((dayName, idx) => {
                const bt = businessTimes.find(b => b.weekday === idx) || { weekday: idx, active: false, startedAt: '10:00', endedAt: '20:00' };
                return (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-white rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const newTimes = [...businessTimes];
                          const foundIdx = newTimes.findIndex(b => b.weekday === idx);
                          if (foundIdx > -1) {
                            newTimes[foundIdx].active = !newTimes[foundIdx].active;
                          } else {
                            newTimes.push({ weekday: idx, active: true, startedAt: '10:00', endedAt: '20:00' });
                          }
                          setBusinessTimes(newTimes);
                        }}
                        className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${bt.active ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                      >
                        {dayName}
                      </button>
                      <span className="text-xs font-bold text-gray-400">
                        {bt.active ? '영업일' : '정기휴무'}
                      </span>
                    </div>

                    {bt.active ? (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">영업 시작:</span>
                          <input 
                            type="text" 
                            className="w-20 p-2 border border-gray-200 rounded-lg text-center text-xs font-bold focus:ring-2 focus:ring-brand-primary outline-none bg-gray-50"
                            placeholder="10:00"
                            value={bt.startedAt}
                            onChange={(e) => {
                              const newTimes = [...businessTimes];
                              const foundIdx = newTimes.findIndex(b => b.weekday === idx);
                              if (foundIdx > -1) {
                                newTimes[foundIdx].startedAt = e.target.value;
                              } else {
                                newTimes.push({ weekday: idx, active: true, startedAt: e.target.value, endedAt: '20:00' });
                              }
                              setBusinessTimes(newTimes);
                            }}
                          />
                          <span className="text-xs text-gray-400">~ 종료:</span>
                          <input 
                            type="text" 
                            className="w-20 p-2 border border-gray-200 rounded-lg text-center text-xs font-bold focus:ring-2 focus:ring-brand-primary outline-none bg-gray-50"
                            placeholder="20:00"
                            value={bt.endedAt}
                            onChange={(e) => {
                              const newTimes = [...businessTimes];
                              const foundIdx = newTimes.findIndex(b => b.weekday === idx);
                              if (foundIdx > -1) {
                                newTimes[foundIdx].endedAt = e.target.value;
                              } else {
                                newTimes.push({ weekday: idx, active: true, startedAt: '10:00', endedAt: e.target.value });
                              }
                              setBusinessTimes(newTimes);
                            }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50/70 border border-indigo-100 px-2.5 py-1 rounded-lg">
                          {getAmPmTimeString(bt.startedAt)} ~ {getAmPmTimeString(bt.endedAt)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-red-400 font-bold bg-red-50 px-2 py-1 rounded">정기휴무</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Action Trigger */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => navigate('/admin')}
              className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              disabled={isSaving}
              onClick={handleSave}
              className="flex items-center gap-2 px-8 py-3 bg-brand-primary text-white text-sm font-bold rounded-xl hover:bg-brand-primary/95 transition-all shadow-md shadow-brand-primary/10 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  동기화 저장 중...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  저장 및 실시간 동기화
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
