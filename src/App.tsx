import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import AiMarketingDemo from './components/AiMarketingDemo';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import InquiryModal from './components/InquiryModal';
import LayerSection from './components/LayerSection';
import PartnersSection from './components/PartnersSection';
import { motion } from 'motion/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSiteContext } from './context/SiteContext';
import { defaultSiteSettings } from './lib/siteSettings';
import { syncNcpProfile } from './lib/syncNcp';
import AiHairModelPage from './pages/AiHairModelPage';
import AiHairModelAppPage from './pages/AiHairModelAppPage';
import AdminPage from './pages/AdminPage'; // Import AdminPage
import AdminLoginPage from './pages/admin/AdminLoginPage';
import SiteEditorPage from './pages/admin/SiteEditorPage'; // Import SiteEditorPage
import ShopManagementPage from './pages/admin/ShopManagementPage'; // O2O Manager
import StoreManagementPage from './pages/admin/StoreManagementPage'; // Store Profile Management
import TestPage from './pages/admin/TestPage';
import CsAdminPage from './pages/CsAdminPage'; // Import CsAdminPage
import SupportPage from './pages/SupportPage'; // Import SupportPage
import PartnersPage from './pages/PartnersPage'; // Import PartnersPage
import ProfilePage from './pages/mypage/Profile';
import SubscriptionPage from './pages/mypage/Subscription';
import BillingPage from './pages/mypage/Billing';
import BillingSuccessPage from './pages/mypage/BillingSuccess';
import BillingFailPage from './pages/mypage/BillingFail';
import PaymentSuccessPage from './pages/mypage/PaymentSuccess';
import PaymentFailPage from './pages/mypage/PaymentFail';
import ReportsPage from './pages/mypage/Reports';
import InstagramPage from './pages/mypage/Instagram';
import MarketingPage from './pages/mypage/Marketing';
import CreditsPage from './pages/mypage/Credits';
import PortfolioPage from './pages/mypage/Portfolio';
import ReferralPage from './pages/mypage/ReferralPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import ChatWidget from './components/ChatWidget';
import MobileShopView from './pages/MobileShopView'; // O2O Customer View
import ShopNotifier from './components/admin/ShopNotifier'; // O2O Notifier
import ParkingPage from './components/ParkingPage';
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';
import { accountClient } from './lib/ncpClient';
import { retrySupabaseSelect, safeJwtDecode } from './lib/supabase-utils';

function LandingPage({ setIsAuthOpen, user }: { setIsAuthOpen: (val: boolean) => void, user: User | null }) {
  const { settings, isLoading } = useSiteContext();
  const order = settings?.sectionOrder || ['features', 'aiDemo', 'pricing', 'partners', 'layer_1'];

  // Only show full black screem loading if absolutely NO settings are loaded and it's fetching
  if (isLoading && settings === defaultSiteSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main>
      <Hero />
      {order.map((sectionId, index) => {
         if (sectionId === 'features') {
            if (settings?.features?.hidden) return null;
            return <Features key={`features-${index}`} />;
         }
         if (sectionId === 'aiDemo') {
            if (settings?.aiDemo?.hidden) return null;
            return <AiMarketingDemo key={`aiDemo-${index}`} user={user} />;
         }
         if (sectionId === 'pricing') {
            if (settings?.pricing?.hidden) return null;
            return <Pricing key={`pricing-${index}`} />;
         }
         if (sectionId === 'partners') {
            if (settings?.partnerSettings?.hidden) return null;
            return <PartnersSection key={`partners-${index}`} />;
         }
         if (sectionId.startsWith('layer_')) {
            const layer = settings?.layers?.find(l => l.id === sectionId);
            if (layer && !layer.hidden) return <LayerSection key={`${layer.id}-${index}`} layer={layer} />;
         }
         return null;
      })}
    </main>
  );
}

function AppContent() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSiteContext();
  const isMounted = useRef(true);
  const lastVerifiedNcpToken = useRef<string | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    // 페이지 이동(라우팅) 시 새로운 컴포넌트가 렌더링되면서 일부 번역이 누락되는 현상을 방지
    // 약간의 딜레이 후 강제로 번역 업데이트 이벤트를 발생시킵니다.
    const timer = setTimeout(() => {
      try {
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (select && select.value) {
          select.dispatchEvent(new Event('change'));
        }
      } catch (e) {
        // 무시
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    // Update Meta tags and Title
    if (settings?.seoSettings) {
      document.title = settings.seoSettings.title || 'Hairdeal';
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', settings.seoSettings.description || '');

      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', settings.seoSettings.keywords || '');

      let metaOgTitle = document.querySelector('meta[property="og:title"]');
      if (!metaOgTitle) {
        metaOgTitle = document.createElement('meta');
        metaOgTitle.setAttribute('property', 'og:title');
        document.head.appendChild(metaOgTitle);
      }
      metaOgTitle.setAttribute('content', settings.seoSettings.title || 'Hairdeal');

      let metaOgDesc = document.querySelector('meta[property="og:description"]');
      if (!metaOgDesc) {
        metaOgDesc = document.createElement('meta');
        metaOgDesc.setAttribute('property', 'og:description');
        document.head.appendChild(metaOgDesc);
      }
      metaOgDesc.setAttribute('content', settings.seoSettings.description || '');

      let metaOgImage = document.querySelector('meta[property="og:image"]');
      if (!metaOgImage) {
        metaOgImage = document.createElement('meta');
        metaOgImage.setAttribute('property', 'og:image');
        document.head.appendChild(metaOgImage);
      }
      if (settings.seoSettings.ogImage) {
        metaOgImage.setAttribute('content', settings.seoSettings.ogImage);
      }
    }
  }, [settings?.seoSettings]);

  useEffect(() => {
    const isSystemAdmin = (user?.email === 'cubric.ceo@gmail.com') || (localStorage.getItem('ncp_admin') === 'true');
    if (isSystemAdmin) return;

    const hiddenRoutes: Record<string, string> = {
      '/ai-hair-model': 'aiModel',
      '/ai-hair-model_app': 'aiModel',
      '/cs-admin': 'csAdmin',
      '/admin': 'saasAdmin',
      '/admin/site-editor': 'siteEditor',
      '/mypage/profile': 'profile',
      '/mypage/portfolio': 'portfolio',
      '/mypage/subscription': 'subscription',
      '/mypage/billing': 'billing',
      '/mypage/credits': 'credits',
      '/mypage/reports': 'reports',
      '/mypage/instagram': 'instagram',
      '/mypage/marketing': 'marketing',
      '/mypage/referral': 'referral',
    };
    
    const currKey = hiddenRoutes[location.pathname];
    if (currKey && settings?.nav?.mypageMenuVisibility?.[currKey]) {
      navigate('/', { replace: true });
    }
  }, [location.pathname, settings?.nav?.mypageMenuVisibility, navigate, user]);

  useEffect(() => {
    // Check for referral code in URL
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      localStorage.setItem('referral_code', refCode);
    }
  }, []);

  const checkingReward = useRef<string | null>(null);
  const checkingWelcomeReward = useRef<string | null>(null);
  const lastProcessedKey = useRef<string | null>(null);

  const getLocalTxs = (userId: string): any[] => {
    try {
      const key = `local_txs_${userId}`;
      const current = localStorage.getItem(key);
      return current ? JSON.parse(current) : [];
    } catch (e) {
      return [];
    }
  };

  const saveLocalTx = (userId: string, tx: any) => {
    try {
      const key = `local_txs_${userId}`;
      const list = getLocalTxs(userId);
      const isDup = list.some((item: any) => item.description === tx.description && item.type === tx.type);
      if (!isDup) {
        list.unshift({
          id: tx.id || 'local_' + Math.random().toString(36).substring(2, 11),
          type: tx.type,
          amount: tx.amount,
          description: tx.description,
          created_at: tx.created_at || new Date().toISOString()
        });
        localStorage.setItem(key, JSON.stringify(list));
        console.log(`[Offline Fallback] Logged transactional token locally successfully: "${tx.description}" (${tx.amount} credits)`);
      }
    } catch (e) {
      console.warn("Failed to write offline fallback transaction:", e);
    }
  };

  const getAuthToken = async (): Promise<string | null> => {
    const ncpToken = localStorage.getItem('ncp_access_token');
    if (ncpToken) return ncpToken;
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  };

  const checkWelcomeReward = async (currentUser: User) => {
    const lockKey = `${currentUser.id}_welcome`;
    
    if (checkingWelcomeReward.current === lockKey || (lastProcessedKey.current && lastProcessedKey.current.includes('welcome'))) return;
    checkingWelcomeReward.current = lockKey;

    try {
      // Check offline local log first
      const hasLocalWelcome = getLocalTxs(currentUser.id).some((t: any) => t.description === '신규 가입 환영 보상');
      if (hasLocalWelcome) {
        lastProcessedKey.current = (lastProcessedKey.current || '') + '|welcome';
        checkingWelcomeReward.current = null;
        return;
      }

      const token = await getAuthToken();
      if (!token || !isMounted.current) {
        checkingWelcomeReward.current = null;
        return;
      }

      const response = await fetch('/api/credits/welcome-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Welcome reward API returned: ${response.status}`);
      }

      const result = await response.json();
      if (result.ok && isMounted.current) {
        lastProcessedKey.current = (lastProcessedKey.current || '') + '|welcome';
        window.dispatchEvent(new Event('credits_updated'));
      }
    } catch (err: any) {
      console.warn("Welcome reward check skipped or failed, fallback to local:", err.message || err);
    } finally {
      checkingWelcomeReward.current = null;
    }
  };

  const checkDailyReward = async (currentUser: User) => {
    const getKSTDateString = () => {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date());
    };
    const today = getKSTDateString();
    
    const lockKey = `${currentUser.id}_${today}`;
    if (checkingReward.current === lockKey || (lastProcessedKey.current && lastProcessedKey.current.includes(today))) return;
    checkingReward.current = lockKey;

    try {
      const rewardDescription = "일일 로그인 출석 보상";

      // Check offline local log first
      const localTxs = getLocalTxs(currentUser.id);
      const todayLocalExists = localTxs.some((t: any) => 
        t.description === rewardDescription && 
        new Date(t.created_at).toDateString() === new Date().toDateString()
      );
      if (todayLocalExists) {
        lastProcessedKey.current = (lastProcessedKey.current || '') + `|${today}`;
        checkingReward.current = null;
        return;
      }

      const token = await getAuthToken();
      if (!token || !isMounted.current) {
        checkingReward.current = null;
        return;
      }

      const response = await fetch('/api/credits/daily-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Daily reward API returned: ${response.status}`);
      }

      const result = await response.json();
      if (result.ok && isMounted.current) {
        lastProcessedKey.current = (lastProcessedKey.current || '') + `|${today}`;
        window.dispatchEvent(new Event('credits_updated'));
      }
    } catch (err: any) {
      console.warn("Daily reward check skipped or failed, fallback to local:", err.message || err);
    } finally {
      checkingReward.current = null;
    }
  };

  const ensureProfileExists = async (currentUser: User) => {
    const lockKey = `${currentUser.id}_ensure_profile`;
    if (lastProcessedKey.current && lastProcessedKey.current.includes('ensured')) return;
    
    try {
      const token = await getAuthToken();
      if (!token || !isMounted.current) return;

      const response = await fetch('/api/credits/ensure-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: currentUser.user_metadata?.full_name || null,
          email: currentUser.email || null,
          referralCode: localStorage.getItem('referral_code') || null
        })
      });

      if (!response.ok) {
        throw new Error(`Ensure profile API returned: ${response.status}`);
      }

      const result = await response.json();
      if (result.ok && isMounted.current) {
        console.log("Profile ensured successfully on secure backend:", result);
        lastProcessedKey.current = (lastProcessedKey.current || '') + '|ensured';
      }
    } catch (err: any) {
      console.warn("[ensureProfileExists] Error securing profile existence:", err.message);
    }
  };

  useEffect(() => {
    let supabaseSub: any = null;

    const checkNcpSession = async () => {
      const ncpToken = localStorage.getItem('ncp_access_token');
      if (ncpToken) {
        // Prevent redundant heavy background API calls if token hasn't changed and user state exists
        if (lastVerifiedNcpToken.current === ncpToken && user) {
          return true;
        }

        try {
          // Decode JWT payload safely
          const decoded = safeJwtDecode(ncpToken);
          
          if (decoded && decoded.id) {
            const isExpired = decoded.exp ? (decoded.exp * 1000) < Date.now() : false;
            
            if (isExpired) {
              console.warn("[checkNcpSession] NCP token is expired (by local JWT parse). Attempting to refresh via Supabase session if available or force re-authenticate.");
              const { data: { session: supaSession } } = await supabase.auth.getSession();
              if (supaSession?.user?.id) {
                 const fallbackNcpId = supaSession.user.id.replace(/-/g, '');
                 let fetchSignal;
                 if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
                   fetchSignal = AbortSignal.timeout(5000);
                 } else {
                   const controller = new AbortController();
                   setTimeout(() => controller.abort(), 5000);
                   fetchSignal = controller.signal;
                 }
                 const ncpTokenRes = await fetch('/api/auth/ncp-token', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${supaSession.access_token}`
                    },
                    body: JSON.stringify({ 
                      ncpDesignerId: fallbackNcpId,
                      name: supaSession.user.user_metadata?.full_name || '디자이너',
                      email: supaSession.user.email,
                      mobileNumber: supaSession.user.user_metadata?.phone || ''
                    }),
                    signal: fetchSignal
                 }).catch(() => null);
                 if (ncpTokenRes && ncpTokenRes.ok) {
                    const { token, refreshToken } = await ncpTokenRes.json();
                    localStorage.setItem('ncp_access_token', token);
                    if (refreshToken) localStorage.setItem('ncp_refresh_token', refreshToken);
                    window.dispatchEvent(new Event('ncp_auth_changed'));
                    return true;
                 }
              }
              
              // If Supabase session is missing or ncp-token fetch failed, clear the expired NCP token
              localStorage.removeItem('ncp_access_token');
              return false; // Fallback to normal Supabase init if any
            }

            const rawId = decoded.id;
            const fullUuid = rawId.includes('-')
              ? rawId
              : `${rawId.substring(0, 8)}-${rawId.substring(8, 12)}-${rawId.substring(12, 16)}-${rawId.substring(16, 20)}-${rawId.substring(20)}`;
            
            const isSystemAdmin = decoded.email === 'cubric.ceo@gmail.com' || localStorage.getItem('ncp_admin') === 'true';
            if (isSystemAdmin) {
              console.log("[checkNcpSession] System Admin detected. Bypassing live NCP detail fetch.");
              const initialUser = {
                id: fullUuid,
                email: decoded.email || 'cubric.ceo@gmail.com',
                user_metadata: {
                  full_name: decoded.name || '관리자 (System Admin)',
                  phone: decoded.mobileNumber || ''
                }
              };
              setUser(initialUser as any);
              setIsAuthInitialized(true);
              lastVerifiedNcpToken.current = ncpToken;
              return true;
            }
            
            // Set initial user state synchronously to prevent black screen lock!
            const initialUser = {
              id: fullUuid,
              email: decoded.email || `${rawId}@ncp.local`,
              user_metadata: {
                full_name: decoded.name || '사용자',
                phone: decoded.mobileNumber || ''
              }
            };
            setUser(initialUser as any);
            setIsAuthInitialized(true);

            // Now, run the heavy async background fetch of details & profile ID
            (async () => {
              let finalId = fullUuid;
              if (decoded.email && isMounted.current) {
                try {
                  const { data: matchedProfile } = await retrySupabaseSelect<any>(() => supabase
                    .from('profiles')
                    .select('id')
                    .eq('email', decoded.email)
                    .maybeSingle() as any);
                  if (matchedProfile && (matchedProfile as any).id && isMounted.current) {
                    finalId = (matchedProfile as any).id;
                    console.log("Resolved NCP user email to existing Supabase profile ID:", finalId);
                  }
                } catch (profileLookupErr) {
                  console.warn("Could not lookup profile by email:", profileLookupErr);
                }
              }

              if (!isMounted.current) return;

              let ncpName = decoded.name;
              let ncpEmail = decoded.email;
              let ncpPhone = decoded.mobileNumber || '';
              let ncpAvatarUrl = '';
              try {
                const detailRes = await accountClient.get('/designer/detail');
                if (detailRes && detailRes.data && isMounted.current) {
                  if (detailRes.data.name && detailRes.data.name !== '디자이너' && detailRes.data.name !== '사용자') {
                    ncpName = detailRes.data.name;
                  }
                  if (detailRes.data.email && !detailRes.data.email.endsWith('@ncp.local')) {
                    ncpEmail = detailRes.data.email;
                  }
                  if (detailRes.data.mobileNumber || detailRes.data.phone) {
                    ncpPhone = detailRes.data.mobileNumber || detailRes.data.phone;
                  }
                  const cands: string[] = [];
                  const pf = detailRes.data.profile;
                  if (pf) {
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
                  if (cands.length > 0) ncpAvatarUrl = Array.from(new Set(cands)).join(',');
                }
              } catch (detailErr: any) {
                console.warn("[checkNcpSession] Live NCP detail fetch failed:", detailErr);
                const status = detailErr.response?.status;
                const isWithdrawn = status === 400 || status === 401 || status === 403 || status === 404 || status === 500;

                if (isWithdrawn && isMounted.current && !localStorage.getItem('ncp_admin')) {
                  console.log("[checkNcpSession] Live NCP account withdrawn or token invalid. Auto logging out...");
                  localStorage.removeItem('ncp_access_token');
                  localStorage.removeItem('ncp_refresh_token');
                  localStorage.removeItem('ncp_admin');
                  localStorage.clear();
                  sessionStorage.clear();
                  supabase.auth.signOut().catch(() => {});
                  setUser(null);
                  window.dispatchEvent(new Event('ncp_auth_changed'));
                  alert('회원 정보가 유효하지 않거나 탈퇴된 계정입니다. 자동으로 로그아웃됩니다.');
                  window.location.href = window.location.origin + '/?logout=' + Date.now();
                  return;
                }
              }

              if (isMounted.current) {
                const synthesizedUser = {
                  id: finalId,
                  email: ncpEmail || `${rawId}@ncp.local`,
                  user_metadata: {
                    full_name: ncpName || '사용자',
                    phone: ncpPhone || '',
                    avatar_url: ncpAvatarUrl || ''
                  }
                };
                setUser(synthesizedUser as any);
                lastVerifiedNcpToken.current = ncpToken;

                // Under user instruction, we bypass all online Supabase profile and metadata sync updates for NCP user sessions.
                // This shields NCP designer profiles from any Supabase schema changes or validation warnings.
              }
            })();

            return true;
          }
        } catch (e) {
          console.warn("NCP session load failed, retaining token as requested.", e);
        }
      }
      return false;
    };

    const initAuth = async () => {
      // Aggressive logout URL param interception
      const params = new URLSearchParams(window.location.search);
      if (params.get('logout')) {
        setUser(null);
        lastVerifiedNcpToken.current = null;
        setIsAuthInitialized(true);
        try {
          supabase.auth.signOut().catch(() => {});
        } catch (_) {}
        try {
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        } catch (_) {}
        return;
      }

      const hasNcp = await checkNcpSession();
      if (!hasNcp) {
        // Fallback to Supabase
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setIsAuthInitialized(true);
        
        if (currentUser) {
          // Fire and forget rewards and profile creation so it doesn't block the UI
          (async () => {
            try {
              await ensureProfileExists(currentUser);
              await checkWelcomeReward(currentUser);
              await checkDailyReward(currentUser);
            } catch (err: any) {
              console.warn("Supabase user rewards check failed:", err.message);
            }
          })();
        }
      }
    };

    initAuth().catch(e => console.error(e)).finally(() => setIsAuthInitialized(true));

    // Setup Supabase change listener as fallback/sync
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('logout')) {
        setUser(null);
        lastVerifiedNcpToken.current = null;
        return;
      }

      const ncpToken = localStorage.getItem('ncp_access_token');
      if (ncpToken) {
        // If logged into NCP, let NCP take full precedence
        await checkNcpSession();
        return;
      }
      
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        const runRewards = async () => {
          await ensureProfileExists(currentUser);
          await checkWelcomeReward(currentUser);
          await checkDailyReward(currentUser);

          if (event === 'SIGNED_IN') {
             try {
               await supabase.from('login_histories').insert([{
                 profile_id: currentUser.id,
                 email: currentUser.email,
                 user_agent: navigator.userAgent,
                 ip_address: 'CLIENT_IP_HIDDEN'
               }]);
             } catch (e: any) {
               if (e?.message !== 'Failed to fetch' && e?.message !== 'FetchError') {
                 console.error("Login history logging failed:", e);
               }
             }

             // If this was an OAuth login (or any login) and we don't have an NCP token yet, sync it!
             if (!localStorage.getItem('ncp_access_token')) {
               console.log("Supabase signed in but no NCP token found, syncing NCP profile...");
               await syncNcpProfile(currentUser);
             }
          }
        };
        runRewards();
      }
    });
    supabaseSub = subscription;

    const handleNcpAuthChanged = () => {
      lastVerifiedNcpToken.current = null;
      initAuth();
    };
    window.addEventListener('ncp_auth_changed', handleNcpAuthChanged);

    return () => {
      window.removeEventListener('ncp_auth_changed', handleNcpAuthChanged);
      if (supabaseSub) supabaseSub.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleOpenAuth = () => {
      if (user) {
        navigate('/mypage/subscription');
      } else {
        setIsAuthOpen(true);
      }
    };
    window.addEventListener('open-auth', handleOpenAuth);
    return () => window.removeEventListener('open-auth', handleOpenAuth);
  }, [user, navigate]);

  useEffect(() => {
    const handleOpenInquiry = () => setIsInquiryOpen(true);
    window.addEventListener('open-inquiry', handleOpenInquiry);
    return () => window.removeEventListener('open-inquiry', handleOpenInquiry);
  }, []);

  // Hash scrolling logic
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        // Add a small delay to ensure rendering is complete before scrolling
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [location.pathname, location.hash]);

  // Handle OAuth Callback popup communication
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const oauthProvider = searchParams.get('oauth_callback');
    if (oauthProvider && window.opener) {
      window.opener.postMessage({ 
        type: 'OAUTH_AUTH_SUCCESS', 
        provider: oauthProvider, 
        username: `user_${oauthProvider}_${Math.floor(Math.random()*1000)}` 
      }, '*');
      window.close();
    }
  }, []);

  // Handle Supabase OAuth message events in the parent iframe / main application
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { session, ncpToken } = event.data;
        if (ncpToken) {
          localStorage.setItem('ncp_access_token', ncpToken.token);
          if (ncpToken.refreshToken) localStorage.setItem('ncp_refresh_token', ncpToken.refreshToken);
          window.dispatchEvent(new Event('ncp_auth_changed'));
        }
        if (session) {
          console.log("Supabase OAuth session received from popup!", session);
          try {
            const { error } = await supabase.auth.setSession({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
            });
            if (!error) {
              console.log("Successfully synchronized login session inside parent client!");
              setIsAuthOpen(false);
            } else {
              console.error("Failed to set session in parent client:", error.message);
            }
          } catch (e) {
            console.error("Error synchronizing session in parent client:", e);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthOpen(false);
    navigate('/mypage/subscription');
  };

  if (!isAuthInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-4 border-white/20 border-t-brand-primary rounded-full animate-spin" />
      </div>
    );
  }

  const isSystemAdmin = (user?.email === 'cubric.ceo@gmail.com') || localStorage.getItem('ncp_admin') === 'true';
  
  // AI Studio 개발환경(로컬 및 프리뷰)에서는 파킹 페이지 활성화 설정을 임시 우회(비활성화)합니다.
  const isAiStudio = typeof window !== 'undefined' && (
    window.location.hostname.includes('ais-dev') || 
    window.location.hostname.includes('ais-pre') || 
    window.location.hostname.includes('localhost')
  );
  
  if (settings?.parkingPage?.enabled && !isSystemAdmin && location.pathname !== '/admin/login' && !isAiStudio) {
    return <ParkingPage />;
  }

  return (
    <div className="min-h-screen bg-bg-base transition-colors duration-500">
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      
      {!location.pathname.startsWith('/m/shop') && location.pathname !== '/admin/login' && (
        <div className={location.pathname === '/ai-hair-model' || location.pathname === '/ai-hair-model_app' ? 'hidden md:block' : ''}>
          <Navbar user={user} />
        </div>
      )}
      <EventPopup />
      <Routes>
        <Route path="/" element={<LandingPage setIsAuthOpen={setIsAuthOpen} user={user} />} />
        <Route path="/events" element={<EventsPage user={user} />} />
        <Route path="/partners" element={<PartnersPage />} />
        <Route path="/ai-hair-model" element={<AiHairModelPage user={user} />} />
        <Route path="/ai-hair-model_app" element={<AiHairModelAppPage user={user} />} />
        <Route path="/admin" element={<AdminPage user={user} />} />
        <Route path="/admin/test" element={<TestPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/site-editor" element={<SiteEditorPage user={user} />} />
        <Route path="/admin/shop" element={<ShopManagementPage user={user} />} />
        <Route path="/admin/store" element={<StoreManagementPage user={user} />} />
        <Route path="/security-admin" element={<SecurityAdminPage user={user} />} />
        <Route path="/cs-admin" element={<CsAdminPage user={user} />} />
        <Route path="/support" element={<SupportPage user={user} />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/m/shop/:shopId/:tableNumber" element={<MobileShopView />} />
        
        {/* My Page Routes */}
        <Route path="/mypage/profile" element={<ProfilePage />} />
        <Route path="/mypage/portfolio" element={<PortfolioPage />} />
        <Route path="/mypage/subscription" element={<SubscriptionPage />} />
        <Route path="/mypage/billing" element={<BillingPage />} />
        <Route path="/payment/billing-success" element={<BillingSuccessPage />} />
        <Route path="/payment/billing-fail" element={<BillingFailPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/fail" element={<PaymentFailPage />} />
        <Route path="/mypage/credits" element={<CreditsPage user={user} />} />
        <Route path="/mypage/reports" element={<ReportsPage />} />
        <Route path="/mypage/instagram" element={<InstagramPage />} />
        <Route path="/mypage/marketing" element={<MarketingPage />} />
        <Route path="/mypage/referral" element={<ReferralPage user={user} />} />
      </Routes>
      {!location.pathname.startsWith('/m/shop') && location.pathname !== '/admin/login' && (
        <div className={location.pathname === '/ai-hair-model' || location.pathname === '/ai-hair-model_app' ? 'hidden md:block' : ''}>
          <Footer />
        </div>
      )}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLoginSuccess={handleLoginSuccess} />
      <InquiryModal isOpen={isInquiryOpen} onClose={() => setIsInquiryOpen(false)} />
      {location.pathname !== '/cs-admin' && location.pathname !== '/ai-hair-model_app' && !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/m/shop') && <ChatWidget user={user} />}
      {user && !location.pathname.startsWith('/m/shop') && <ShopNotifier user={user} />}
    </div>
  );
}

import { SiteProvider } from './context/SiteContext';

import SecurityAdminPage from "./pages/SecurityAdminPage";

import EventsPage from './pages/EventsPage';
import EventPopup from './components/EventPopup';

import ResetPasswordPage from './pages/ResetPasswordPage';

export default function App() {
  return (
    <SiteProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </SiteProvider>
  );
}

