import { motion, AnimatePresence } from 'motion/react';
import { Scissors, Menu, X, LogOut, LogIn, ChevronDown, ChevronLeft, ChevronRight, User as UserIcon, CreditCard, Receipt, Coins, BarChart, Instagram, PieChart, Sparkles, Shield, HelpCircle, Headset, Image, Layout, Store, Globe, UserPlus, QrCode } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { User } from '@supabase/supabase-js';
import { Link, useNavigate } from 'react-router-dom';
import { useSiteContext } from '../context/SiteContext';
import { retrySupabaseSelect, safeJwtDecode } from '../lib/supabase-utils';
import { AvatarImage } from './AvatarImage';
import { accountClient } from '../lib/ncpClient';

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [menuView, setMenuView] = useState<'main' | 'mypage'>('main');
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { settings } = useSiteContext();
  const { nav } = settings;

  const [userName, setUserName] = useState<string | null>(null);
  const [isCsAdmin, setIsCsAdmin] = useState(false);

  
  const isMounted = useRef(true);
  const lastFetchTime = useRef(0);

  useEffect(() => {
    isMounted.current = true;
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      isMounted.current = false;
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const changeLanguage = (lang: string) => {
    localStorage.setItem('preferredLang', lang);
    const host = window.location.hostname;
    
    // 기존 설정된 언어 쿠키 삭제
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${host}; path=/;`;
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.${host}; path=/;`;

    // 새 언어 적용 ('ko'가 아닐 때만)
    if (lang !== 'ko') {
      document.cookie = `googtrans=/ko/${lang}; path=/;`;
      document.cookie = `googtrans=/ko/${lang}; domain=${host}; path=/;`;
      document.cookie = `googtrans=/ko/${lang}; domain=.${host}; path=/;`;
    }

    try {
      // 1차적으로 콤보박스를 통해 즉시 렌더링하도록 유도
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (select) {
        select.value = lang === 'ko' ? '' : lang;
        select.dispatchEvent(new Event('change'));
      }
    } catch (e) {
      // ignore
    }

    // 확실한 적용을 위해 약간의 딜레이 후 새로고침 (React 상태 꼬임 방지)
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  const currentLang = localStorage.getItem('preferredLang') || 'ko';

  const fetchCredits = useCallback(async (force: boolean = false) => {
    if (!user || !isMounted.current) {
      if (isMounted.current) {
        setUserCredits(null);
        setUserName(null);
        setIsCsAdmin(false);
      }
      return;
    }

    // Throttle: avoid redundant fetches
    const now = Date.now();
    if (!force && now - lastFetchTime.current < 2000) return;
    lastFetchTime.current = now;

    setUserName(user.user_metadata?.full_name || '원장님');
    if (user.email === 'cubric.ceo@gmail.com') setIsCsAdmin(true);
    else setIsCsAdmin(false);

    try {
      const ncpToken = localStorage.getItem('ncp_access_token');
      let currentCredits = 0;
      let plan = 'Free';
      let foundNcp = false;
      
      if (ncpToken) {
        try {
          const decoded = safeJwtDecode(ncpToken);
          const ncpDesignerId = decoded?.id;
          
          if (ncpDesignerId) {
            const { apiClient } = await import('../lib/ncpClient');
            try {
              let res: any;
              try {
                res = await apiClient.get('/faceswap/credit');
              } catch (err: any) {
                console.log("Navbar: /faceswap/credit failed, trying /summary fallback...");
                res = await apiClient.get('/faceswap/credit/summary');
              }
              
              if (res.data?.credit !== undefined) {
                currentCredits = res.data.credit;
                if (isMounted.current) {
                  setUserName(decoded?.name || decoded?.name_en || decoded?.full_name || user.user_metadata?.full_name || '디자이너');
                }
                foundNcp = true;
              } else if (res.data?.credits !== undefined) {
                currentCredits = res.data.credits;
                if (isMounted.current) {
                  setUserName(decoded?.name || decoded?.name_en || decoded?.full_name || user.user_metadata?.full_name || '디자이너');
                }
                foundNcp = true;
              }
            } catch (summaryErr: any) {
              if (summaryErr?.response?.status !== 500) {
                console.warn("Summary credit API failed in navbar, using token name fallback", summaryErr);
              }
              if (isMounted.current) {
                setUserName(decoded?.name || decoded?.name_en || decoded?.full_name || user.user_metadata?.full_name || '디자이너');
              }
            }
          }
        } catch (e) {
          console.warn("NCP Parse error in navbar fetchCredits", e);
        }
      }
      
      const { data, error } = await retrySupabaseSelect<any>(() => supabase.from('profiles').select('credits, full_name, is_cs_admin, subscription_plan').eq('id', user.id).maybeSingle() as any);
      if (isMounted.current && !error && data) {
        if (!foundNcp && (data as any).credits !== undefined) currentCredits = (data as any).credits;
        const profileFullName = (data as any).full_name;
        if (profileFullName) {
          setUserName((prevName) => {
            if (!prevName || prevName === '디자이너' || prevName === '원장님' || prevName === '사용자') {
              return profileFullName;
            }
            return prevName;
          });
        }
        if ((data as any).is_cs_admin) setIsCsAdmin(true);
        if ((data as any).subscription_plan) {
          plan = (data as any).subscription_plan;
        }
      }
      
      const metaAvatar = user.user_metadata?.avatar_url;
      if (metaAvatar && isMounted.current) {
        setAvatarUrl(metaAvatar);
      }

      // Background sync latest designer detail image candidates
      try {
        accountClient.get(`/designer/detail?_t=${Date.now()}`).then(detailRes => {
          if (detailRes && detailRes.data && isMounted.current) {
            const cands: string[] = [];
            const pf = detailRes.data.profile;
            if (pf) {
              if (Array.isArray(pf.details) && typeof pf.details[0] === 'string') {
                cands.push(`https://api.cubric.io/api/storage?fileName=${pf.details[0]}`);
              }
              if (pf.thumbNailPath) cands.push(pf.thumbNailPath);
              if (pf.fileName) cands.push(pf.fileName);
              if (pf.savedFileName) cands.push(pf.savedFileName);
              if (pf.savedPath) cands.push(pf.savedPath);
              if (pf.path) cands.push(pf.path);
              if (pf.id) cands.push(pf.id);
              if (pf.fileId) cands.push(pf.fileId);
              if (pf.file_id) cands.push(pf.file_id);
            }
            if (detailRes.data.file_id) cands.push(detailRes.data.file_id);
            if (detailRes.data.fileId) cands.push(detailRes.data.fileId);
            const directOpts = [detailRes.data.profileImageUrl, detailRes.data.profileImage, detailRes.data.imageUrl, detailRes.data.image, detailRes.data.avatarUrl, detailRes.data.avatar_url];
            directOpts.forEach(u => { if (u) cands.push(u); });
            
            // Check for freshly uploaded Blob URL on the same window
            const tempBlob = localStorage.getItem('temp_profile_blob');
            if (tempBlob) {
              cands.unshift(tempBlob);
            }

            if (cands.length > 0) {
              const freshImg = Array.from(new Set(cands)).join(',');
              setAvatarUrl(freshImg);
            }
            if (detailRes.data.name) {
              setUserName(detailRes.data.name);
            }
          }
        }).catch(err => {
          console.warn("NCP profile meta synchronization bypassed in Navbar:", err);
          const tempBlob = localStorage.getItem('temp_profile_blob');
          if (tempBlob) {
            setAvatarUrl(tempBlob);
          }
        });
      } catch (err) {
        // Ignored
        const tempBlob = localStorage.getItem('temp_profile_blob');
        if (tempBlob) {
          setAvatarUrl(tempBlob);
        }
      }
      
      if (!foundNcp) {
        // Calculate from transactions as a fallback
        const { data: txs } = await retrySupabaseSelect<any>(() => supabase.from('credit_transactions').select('*').eq('user_id', user.id) as any);
        if (txs) {
          const calculated = (txs as any[]).reduce((acc, tx) => tx.type === 'earned' ? acc + tx.amount : acc - tx.amount, 0);
          if (calculated !== currentCredits) {
             currentCredits = calculated;
             // Sync with profile (non-blocking)
             supabase.from('profiles').update({ credits: currentCredits }).eq('id', user.id).then();
          }
        }
      }
      
      if (isMounted.current) {
        setUserCredits(currentCredits);
        setUserPlan(plan);
      }
    } catch (err: any) {
      if (err?.message !== 'Failed to fetch' && err?.message !== 'FetchError') {
        console.error("Failed to fetch credits", err);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchCredits();

    // Set up Realtime subscription
    let subscription: any = null;
    if (user) {
      const channel = supabase
        .channel(`profiles_${user.id}_navbar_${Math.random().toString(36).substring(7)}`)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles',
          filter: `id=eq.${user.id}`
        }, (payload) => {
          if (isMounted.current && payload.new) {
            if (payload.new.credits !== undefined) {
              setUserCredits(payload.new.credits);
            }
            if (payload.new.full_name) {
              setUserName(payload.new.full_name);
            }
            if (payload.new.subscription_plan !== undefined) {
              setUserPlan(payload.new.subscription_plan);
            }
            if (payload.new.avatar_url !== undefined) {
              setAvatarUrl(payload.new.avatar_url);
            }
          }
        });
      
      subscription = channel.subscribe();
    }

    const onCreditsUpdated = () => {
      fetchCredits(true);
    };
    const onProfileUpdated = () => {
      fetchCredits(true);
    };
    window.addEventListener('credits_updated', onCreditsUpdated);
    window.addEventListener('profile_updated', onProfileUpdated);
    return () => {
      window.removeEventListener('credits_updated', onCreditsUpdated);
      window.removeEventListener('profile_updated', onProfileUpdated);
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [user, fetchCredits]);

  const handleLogout = async () => {
    try {
      setIsProfileOpen(false);
      setIsOpen(false);

      // Trigger sign out from Supabase as non-blocking background task to prevent hanging network calls from delaying UI clearing
      supabase.auth.signOut().catch(() => {});
    } catch (e) {
      console.warn("Supabase auth signOut error", e);
    }

    // 2. Clear all local/session storage and cookies completely
    localStorage.removeItem('ncp_access_token');
    localStorage.removeItem('ncp_refresh_token');
    localStorage.removeItem('ncp_admin');
    localStorage.clear();
    sessionStorage.clear();
    
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // 3. Dispatch events to immediately decouple UI from user session
    window.dispatchEvent(new Event('ncp_auth_changed'));

    // 4. Navigate nicely instead of breaking iframe with hard location replaces
    setTimeout(() => {
      navigate('/?logout=' + Date.now(), { replace: true });
    }, 100);
  };

  const userHasShopAccess = () => {
    if (settings.nav.mypageMenuVisibility?.shop) return false;
    
    const anyPlanHasQr = settings.pricing?.plans?.some(p => p.qrServiceEnabled);
    if (!anyPlanHasQr) return true;
    
    if (user?.email === 'cubric.ceo@gmail.com') return true;
    
    if (!userPlan) return false; 
    const activePlanSettings = settings.pricing?.plans?.find(p => p.name === userPlan);
    return !!activePlanSettings?.qrServiceEnabled;
  };

  const isShopVisible = userHasShopAccess();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[1000] bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex justify-between items-center h-20">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <Link to="/" className="text-2xl font-[800] text-brand-primary tracking-tighter uppercase relative z-[1001]">
                {nav?.logoType === 'text' ? (
                  <span>{(nav.logoText || 'AI_HAIR').split('_').map((part, i) => i === 1 ? <span key={i} className="text-brand-accent">{part}</span> : part)}</span>
                ) : nav?.logoImage ? (
                  <img 
                    src={nav?.logoImage || undefined} 
                    alt="Logo" 
                    style={{ 
                      width: nav?.logoWidth || 'auto', 
                      height: nav?.logoHeight || '32px' 
                    }}
                    className="object-contain"
                    referrerPolicy="no-referrer" 
                  />
                ) : null}
              </Link>
            </motion.div>

            <div className="hidden md:flex items-center gap-10">
              {nav?.links?.filter(l => !l.hidden).map((link) => (
                <Link 
                  key={link.id} 
                  to={link.href ? (link.href.startsWith('#') ? '/' + link.href : link.href) : '#'} 
                  className="text-[15px] font-bold text-text-light hover:text-brand-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="relative" ref={langRef}>
                <button 
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-2 text-[15px] font-bold text-gray-700 hover:text-brand-primary transition-colors"
                >
                  <Globe className="w-5 h-5" />
                  <span className="uppercase">{currentLang === 'ja' ? 'JA' : currentLang === 'en' ? 'EN' : 'KO'}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isLangOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-32 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-2 overflow-hidden z-[2001]"
                    >
                      <button onClick={() => changeLanguage('ko')} className={`w-full text-left px-5 py-2.5 text-sm font-bold hover:bg-gray-50 transition-colors ${currentLang === 'ko' ? 'text-brand-primary' : 'text-gray-700'}`}>한국어</button>
                      <button onClick={() => changeLanguage('en')} className={`w-full text-left px-5 py-2.5 text-sm font-bold hover:bg-gray-50 transition-colors ${currentLang === 'en' ? 'text-brand-primary' : 'text-gray-700'}`}>English</button>
                      <button onClick={() => changeLanguage('ja')} className={`w-full text-left px-5 py-2.5 text-sm font-bold hover:bg-gray-50 transition-colors ${currentLang === 'ja' ? 'text-brand-primary' : 'text-gray-700'}`}>日本語</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-100 px-4 py-2 rounded-full transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center overflow-hidden">
                      <AvatarImage url={avatarUrl || user.user_metadata?.avatar_url} fallbackClassName="w-4 h-4 text-brand-primary" />
                    </div>
                    <span className="text-sm font-bold text-text-dark flex flex-col items-start leading-tight">
                      <span>{userName || '원장님'}</span>
                      {userCredits !== null && (
                         <span className="text-[10px] text-brand-secondary font-black">{userCredits} C</span>
                      )}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-2 overflow-hidden z-[2001]"
                      >
                        <div className="px-5 py-3 border-b border-gray-100 mb-2 bg-gray-50/50">
                          <p className="text-sm font-bold text-gray-900">{userName || '원장님'}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        
                        <div className="flex flex-col">
                          {!settings.nav.mypageMenuVisibility?.aiModel && (
                            <Link to="/ai-hair-model" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-brand-primary hover:bg-brand-primary/5 transition-colors text-left bg-brand-primary/5 border-l-2 border-brand-primary">
                              <Sparkles className="w-4 h-4" /> {settings.nav.mypageMenu?.aiModel || 'AI 헤어모델 생성'}
                            </Link>
                          )}
                          
                          {isCsAdmin && !settings.nav.mypageMenuVisibility?.csAdmin && (
                             <>
                              <hr className="border-gray-100 my-1" />
                              <Link to="/cs-admin" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors text-left border-l-2 border-red-500">
                                <Headset className="w-4 h-4" /> {settings.nav.mypageMenu?.csAdmin || 'CS 관리자 페이지'}
                              </Link>
                             </>
                          )}
                          
                          {user.email === 'cubric.ceo@gmail.com' && (
                             <>
                              {!settings.nav.mypageMenuVisibility?.siteEditor && (
                                <>
                                  <hr className="border-gray-100 my-1" />
                                  <Link to="/admin/site-editor" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors text-left border-l-2 border-emerald-500">
                                    <Layout className="w-4 h-4" /> {settings.nav.mypageMenu?.siteEditor || '홈페이지 편집'}
                                  </Link>
                                </>
                              )}
                              {!settings.nav.mypageMenuVisibility?.saasAdmin && (
                                <>
                                  <hr className="border-gray-100 my-1" />
                                  <Link to="/admin" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors text-left border-l-2 border-gray-900">
                                    <Shield className="w-4 h-4" /> {settings.nav.mypageMenu?.saasAdmin || 'SaaS 관리자 대시보드'}
                                  </Link>
                                </>
                              )}
                             </>
                          )}
                          
                          <hr className="border-gray-100 my-1" />
                          <Link to="/admin/store" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-gray-900 bg-gray-50 hover:bg-gray-100 transition-colors text-left border-l-2 border-teal-500">
                            <Store className="w-4 h-4 text-brand-primary" /> 매장 관리
                          </Link>
                          {isShopVisible && (
                            <Link to="/admin/shop" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors text-left border-l-2 border-blue-500">
                              <QrCode className="w-4 h-4" /> QR 서비스 관리
                            </Link>
                          )}
                          {!settings.nav.mypageMenuVisibility?.profile && (
                            <Link to="/mypage/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-primary transition-colors text-left">
                              <UserIcon className="w-4 h-4" /> {settings.nav.mypageMenu?.profile || '프로필 정보'}
                            </Link>
                          )}
                          {!settings.nav.mypageMenuVisibility?.portfolio && (
                            <Link to="/mypage/portfolio" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-primary transition-colors text-left">
                              <Image className="w-4 h-4" /> {settings.nav.mypageMenu?.portfolio || '포트폴리오'}
                            </Link>
                          )}
                          {!settings.nav.mypageMenuVisibility?.subscription && (
                            <Link to="/mypage/subscription" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-primary transition-colors text-left">
                              <CreditCard className="w-4 h-4" /> {settings.nav.mypageMenu?.subscription || '구독관리'} <span className="ml-auto text-xs font-bold bg-gray-100 px-2 py-1 rounded-md text-gray-500">Free 플랜</span>
                            </Link>
                          )}
                          {!settings.nav.mypageMenuVisibility?.billing && (
                            <Link to="/mypage/billing" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-primary transition-colors text-left">
                              <Receipt className="w-4 h-4" /> {settings.nav.mypageMenu?.billing || '결제관리'}
                            </Link>
                          )}
                          {!settings.nav.mypageMenuVisibility?.credits && (
                            <Link to="/mypage/credits" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-primary transition-colors text-left">
                              <Coins className="w-4 h-4" /> {settings.nav.mypageMenu?.credits || '크레딧 관리'} <span className="ml-auto text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-md">충전</span>
                            </Link>
                          )}
                          {!settings.nav.mypageMenuVisibility?.reports && (
                            <Link to="/mypage/reports" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-primary transition-colors text-left">
                              <BarChart className="w-4 h-4" /> {settings.nav.mypageMenu?.reports || '보고서'}
                            </Link>
                          )}
                          {!settings.nav.mypageMenuVisibility?.instagram && (
                            <Link to="/mypage/instagram" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-primary transition-colors text-left">
                              <Instagram className="w-4 h-4" /> {settings.nav.mypageMenu?.instagram || '인스타그램 계정관리'}
                            </Link>
                          )}
                          {!settings.nav.mypageMenuVisibility?.marketing && (
                            <Link to="/mypage/marketing" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-primary transition-colors text-left">
                              <PieChart className="w-4 h-4" /> {settings.nav.mypageMenu?.marketing || '마케팅 보고서'}
                            </Link>
                          )}
                          {!settings.nav.mypageMenuVisibility?.referral && (
                            <Link to="/mypage/referral" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-primary transition-colors text-left">
                              <UserPlus className="w-4 h-4" /> {settings.nav.mypageMenu?.referral || '친구 추천 (안내)'}
                            </Link>
                          )}
                          <hr className="border-gray-100 my-1" />
                          <Link to="/support" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-gray-900 bg-gray-50 hover:bg-gray-100 transition-colors text-left border-l-2 border-indigo-400">
                            <HelpCircle className="w-4 h-4 text-indigo-500" /> 고객센터 / 1:1문의
                          </Link>
                        </div>

                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleLogout(); }}
                            className="flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                          >
                            <LogOut className="w-4 h-4" /> 로그아웃
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.dispatchEvent(new CustomEvent('open-auth'))}
                  className="bg-brand-primary text-white px-7 py-3 rounded-full text-sm font-[700] hover:shadow-lg transition-all"
                >
                  무료 시작하기
                </motion.button>
              )}
            </div>

            <div className="md:hidden relative z-[2001]">
              <button 
                onClick={() => {
                  setIsOpen(true);
                  setMenuView('main');
                }} 
                className="p-2 active:scale-95 transition-transform"
              >
                <Menu className="w-6 h-6 text-brand-primary" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu sidebar - MOVED OUTSIDE NAV TO FIX VIEWPORT CLIPPING */}
      <AnimatePresence>
        {isOpen && (
          <div className="md:hidden">
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[2000]"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Sidebar Content */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[300px] bg-white z-[2010] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Sidebar Header */}
              <div className={`h-24 flex items-center px-6 border-b border-gray-100 shrink-0 bg-white justify-between`}>
                {menuView === 'mypage' ? (
                  <button 
                    onClick={() => setMenuView('main')}
                    className="flex items-center gap-1.5 text-gray-500 font-bold py-2 px-1 hover:text-brand-primary active:scale-95 transition-all group"
                  >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                    <span>뒤로가기</span>
                  </button>
                ) : (
                  user && (
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                      <div className="w-11 h-11 rounded-full bg-brand-primary/10 flex items-center justify-center overflow-hidden shrink-0 border border-brand-primary/10">
                        <AvatarImage url={avatarUrl || user.user_metadata?.avatar_url} fallbackClassName="w-5.5 h-5.5 text-brand-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-bold text-gray-900 truncate tracking-tight flex items-center gap-1.5 border-b border-transparent">
                          {userName || '원장님'}
                          {userCredits !== null && (
                             <span className="text-[11px] text-brand-secondary font-black bg-brand-secondary/10 px-1.5 py-0.5 rounded-full">{userCredits} C</span>
                          )}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate leading-none mt-0.5">{user.email}</p>
                      </div>
                    </div>
                  )
                )}
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-3 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
                >
                   <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Menu Content Area - Explicit height for guaranteed render */}
              <div className="flex-1 relative bg-white overflow-hidden">
                {/* Main View - Transitions: Right-to-Left enter, Out to Right exit */}
                <div 
                  className={`absolute inset-0 flex flex-col p-6 overflow-y-auto bg-white transition-all duration-500 ease-in-out ${
                    menuView === 'main' ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                  }`}
                  style={{ zIndex: menuView === 'main' ? 20 : 10 }}
                >
                  {/* Mobile Language Selector */}
                  <div className="flex justify-around bg-gray-50 p-1.5 rounded-xl mb-6 text-sm font-bold">
                    <button onClick={() => changeLanguage('ko')} className={`px-3 py-2 rounded-lg flex-1 text-center transition-all ${currentLang === 'ko' ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}>KO</button>
                    <button onClick={() => changeLanguage('en')} className={`px-3 py-2 rounded-lg flex-1 text-center transition-all ${currentLang === 'en' ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}>EN</button>
                    <button onClick={() => changeLanguage('ja')} className={`px-3 py-2 rounded-lg flex-1 text-center transition-all ${currentLang === 'ja' ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}>JA</button>
                  </div>

                  {/* Dynamic Menu Items based on Login State */}
                  <div className="flex flex-col gap-1 mb-8">
                    {user ? (
                      /* LOGGED IN MENU */
                      <>
                        <div className="flex flex-col pt-4 pb-2 border-b border-gray-100">
                        {!settings.nav.mypageMenuVisibility?.aiModel && (
                          <button 
                            onClick={() => { setIsOpen(false); navigate(window.innerWidth <= 768 ? '/ai-hair-model_app' : '/ai-hair-model'); }}
                            className="flex items-center gap-4 py-4.5 px-5 text-[17px] font-bold text-brand-primary hover:bg-brand-primary/5 rounded-2xl transition-colors text-left"
                          >
                            <Sparkles className="w-5.5 h-5.5" />
                            {settings.nav.mypageMenu?.aiModel || 'AI 헤어모델 생성'}
                          </button>
                        )}

                        {isCsAdmin && !settings.nav.mypageMenuVisibility?.csAdmin && (
                          <button 
                            onClick={() => { setIsOpen(false); navigate('/cs-admin'); }}
                            className="flex items-center gap-4 py-4.5 px-5 text-[17px] font-bold text-red-600 hover:bg-red-50 rounded-2xl transition-colors text-left"
                          >
                            <Headset className="w-5.5 h-5.5 text-red-500" />
                            {settings.nav.mypageMenu?.csAdmin || 'CS 관리자 페이지'}
                          </button>
                        )}
                        
                        {user.email === 'cubric.ceo@gmail.com' && (
                          <>
                            {!settings.nav.mypageMenuVisibility?.siteEditor && (
                              <button 
                                onClick={() => { setIsOpen(false); navigate('/admin/site-editor'); }}
                                className="flex items-center gap-4 py-4.5 px-5 text-[17px] font-bold text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-colors text-left"
                              >
                                <Layout className="w-5.5 h-5.5 text-emerald-500" />
                                {settings.nav.mypageMenu?.siteEditor || '홈페이지 편집'}
                              </button>
                            )}
                            {!settings.nav.mypageMenuVisibility?.saasAdmin && (
                              <button 
                                onClick={() => { setIsOpen(false); navigate('/admin'); }}
                                className="flex items-center gap-4 py-4.5 px-5 text-[17px] font-bold text-gray-900 hover:bg-gray-100 rounded-2xl transition-colors text-left"
                              >
                                <Shield className="w-5.5 h-5.5 text-gray-400" />
                                {settings.nav.mypageMenu?.saasAdmin || 'SaaS 관리자 대시보드'}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        {nav?.links?.filter(l => !l.hidden).map((link) => (
                          <Link 
                            key={link.id} 
                            to={link.href ? (link.href.startsWith('#') ? '/' + link.href : link.href) : '#'} 
                            onClick={() => setIsOpen(false)} 
                            className="flex items-center py-4.5 px-5 text-[17px] font-bold text-gray-800 hover:text-brand-primary hover:bg-gray-50 rounded-2xl transition-colors"
                          >
                            {link.label}
                          </Link>
                        ))}

                        <button 
                          onClick={() => setMenuView('mypage')}
                          className="flex items-center justify-between py-4.5 px-5 text-[17px] font-bold text-gray-800 hover:text-brand-primary hover:bg-gray-50 rounded-2xl transition-colors w-full text-left group"
                        >
                          <span>마이페이지</span>
                          <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </button>

                        <button 
                          onClick={(e) => { e.stopPropagation(); handleLogout(); setIsOpen(false); }}
                          className="flex items-center gap-3.5 py-4.5 px-6 text-[17px] font-bold text-red-500 hover:bg-red-50 rounded-2xl mt-4 active:scale-95 transition-transform"
                        >
                          <LogOut className="w-5.5 h-5.5" />
                          로그아웃
                        </button>
                      </div>
                      </>
                    ) : (
                      /* LOGGED OUT MENU */
                      <>
                        {nav?.links?.filter(l => !l.hidden).map((link) => (
                          <Link 
                            key={link.id} 
                            to={link.href ? (link.href.startsWith('#') ? '/' + link.href : link.href) : '#'} 
                            onClick={() => setIsOpen(false)} 
                            className="flex items-center py-4.5 px-5 text-[17px] font-bold text-gray-800 hover:text-brand-primary hover:bg-gray-50 rounded-2xl transition-colors"
                          >
                            {link.label}
                          </Link>
                        ))}
                        <button 
                          onClick={() => { setIsOpen(false); window.dispatchEvent(new CustomEvent('open-auth')); }}
                          className="flex items-center gap-3.5 py-4.5 px-6 text-[17px] font-bold text-brand-primary bg-brand-primary/5 rounded-2xl mt-4 active:scale-95 transition-transform border border-brand-primary/10"
                        >
                          <LogIn className="w-5.5 h-5.5" />
                          로그인하기
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* My Page View - Transitions: Main goes Right, My Page enters from LEFT */}
                <div 
                  className={`absolute inset-0 flex flex-col p-6 overflow-y-auto bg-white transition-all duration-500 ease-in-out ${
                    menuView === 'mypage' ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
                  }`}
                  style={{ zIndex: menuView === 'mypage' ? 20 : 10 }}
                >

                  <div className="flex flex-col gap-1 pb-10">
                    {[
                      { key: 'store_manage', icon: Store, label: '매장 관리', path: '/admin/store' },
                      { key: 'shop', icon: QrCode, label: 'QR 서비스 관리', path: '/admin/shop' },
                      { key: 'profile', icon: UserIcon, label: settings.nav.mypageMenu?.profile || '프로필 정보', path: '/mypage/profile' },
                      { key: 'portfolio', icon: Image, label: settings.nav.mypageMenu?.portfolio || '포트폴리오', path: '/mypage/portfolio' },
                      { key: 'subscription', icon: CreditCard, label: settings.nav.mypageMenu?.subscription || '구독관리', path: '/mypage/subscription' },
                      { key: 'billing', icon: Receipt, label: settings.nav.mypageMenu?.billing || '결제관리', path: '/mypage/billing' },
                      { key: 'credits', icon: Coins, label: settings.nav.mypageMenu?.credits || '크레딧 관리', path: '/mypage/credits' },
                      { key: 'reports', icon: BarChart, label: settings.nav.mypageMenu?.reports || '보고서', path: '/mypage/reports' },
                      { key: 'instagram', icon: Instagram, label: settings.nav.mypageMenu?.instagram || '인스타그램 계정관리', path: '/mypage/instagram' },
                      { key: 'marketing', icon: PieChart, label: settings.nav.mypageMenu?.marketing || '마케팅 보고서', path: '/mypage/marketing' },
                      { key: 'referral', icon: UserPlus, label: settings.nav.mypageMenu?.referral || '친구 추천 (안내)', path: '/mypage/referral' }
                    ].filter(item => {
                      if (item.key === 'shop') return isShopVisible;
                      if (item.key === 'store_manage') return true;
                      return !settings.nav.mypageMenuVisibility?.[item.key];
                    }).map((item, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => {
                          setIsOpen(false);
                          navigate(item.path);
                        }}
                        className="flex items-center gap-4.5 py-4.5 px-6 text-[17px] font-bold text-gray-700 hover:bg-gray-50 hover:text-brand-primary rounded-2xl transition-all text-left group"
                      >
                        <item.icon className="w-5.5 h-5.5 text-gray-400 group-hover:text-brand-primary transition-colors" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Safe area filler for bottom (iOS) */}
              <div className="h-8 bg-white" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
