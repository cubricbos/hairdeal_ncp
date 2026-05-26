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
import { useState, useEffect, useRef } from 'react';
import { useSiteContext } from './context/SiteContext';
import AiHairModelPage from './pages/AiHairModelPage';
import AiHairModelAppPage from './pages/AiHairModelAppPage';
import AdminPage from './pages/AdminPage'; // Import AdminPage
import SiteEditorPage from './pages/admin/SiteEditorPage'; // Import SiteEditorPage
import ShopManagementPage from './pages/admin/ShopManagementPage'; // O2O Manager
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
import ChatWidget from './components/ChatWidget';
import MobileShopView from './pages/MobileShopView'; // O2O Customer View
import ShopNotifier from './components/admin/ShopNotifier'; // O2O Notifier
import ParkingPage from './components/ParkingPage';
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

function LandingPage({ setIsAuthOpen, user }: { setIsAuthOpen: (val: boolean) => void, user: User | null }) {
  const { settings, isLoading } = useSiteContext();
  const [isFirstLoad] = useState(!localStorage.getItem('siteSettingsFallback'));
  const order = settings?.sectionOrder || ['features', 'aiDemo', 'pricing', 'partners', 'layer_1'];

  if (isFirstLoad && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main>
      <Hero />
      {order.map((sectionId) => {
         if (sectionId === 'features') {
            if (settings?.features?.hidden) return null;
            return <Features key="features" />;
         }
         if (sectionId === 'aiDemo') {
            if (settings?.aiDemo?.hidden) return null;
            return <AiMarketingDemo key="aiDemo" user={user} />;
         }
         if (sectionId === 'pricing') {
            if (settings?.pricing?.hidden) return null;
            return <Pricing key="pricing" />;
         }
         if (sectionId === 'partners') {
            if (settings?.partnerSettings?.hidden) return null;
            return <PartnersSection key="partners" />;
         }
         if (sectionId.startsWith('layer_')) {
            const layer = settings?.layers?.find(l => l.id === sectionId);
            if (layer && !layer.hidden) return <LayerSection key={layer.id} layer={layer} />;
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
  }, [location.pathname, settings?.nav?.mypageMenuVisibility, navigate]);

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

  const checkWelcomeReward = async (currentUser: User) => {
    const lockKey = `${currentUser.id}_welcome`;
    
    if (checkingWelcomeReward.current === lockKey || (lastProcessedKey.current && lastProcessedKey.current.includes('welcome'))) return;
    checkingWelcomeReward.current = lockKey;

    try {
      const { data: metrics } = await supabase.from('app_metrics').select('welcome_credit_reward').eq('id', 1).single();
      const rewardAmount = metrics?.welcome_credit_reward;
      if (!rewardAmount) {
        checkingWelcomeReward.current = null;
        return;
      }

      const { data: existingTxs } = await supabase
        .from('credit_transactions')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('type', 'earned')
        .eq('description', '신규 가입 환영 보상')
        .maybeSingle();

      if (existingTxs) {
        lastProcessedKey.current = (lastProcessedKey.current || '') + '|welcome';
        checkingWelcomeReward.current = null;
        return;
      }

      const { error: insertError } = await supabase.from('credit_transactions').insert([{
        user_id: currentUser.id,
        type: 'earned',
        amount: rewardAmount,
        description: '신규 가입 환영 보상'
      }]);

      if (insertError) throw insertError;

      const { data: profile } = await supabase.from('profiles').select('credits').eq('id', currentUser.id).maybeSingle();
      const currentCredits = profile?.credits || 0;
      
      const { error: updateError } = await supabase.from('profiles').update({
        credits: currentCredits + rewardAmount
      }).eq('id', currentUser.id);

      if (updateError) console.error("Welcome Reward profile update failed:", updateError);

      lastProcessedKey.current = (lastProcessedKey.current || '') + '|welcome';
      window.dispatchEvent(new Event('credits_updated'));
    } catch (err: any) {
      if (err?.message !== 'Failed to fetch' && err?.message !== 'FetchError') {
        console.error("Welcome reward check failed", err);
      }
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
      const { data: metrics } = await supabase.from('app_metrics').select('daily_credit_reward').eq('id', 1).single();
      const rewardAmount = metrics?.daily_credit_reward;
      if (!rewardAmount) {
        checkingReward.current = null;
        return;
      }

      const rewardDescription = "일일 로그인 출석 보상";
      const dateParts = today.split("-").map(Number);
      const kstStart = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2]));
      kstStart.setUTCHours(kstStart.getUTCHours() - 9); 
      const kstEnd = new Date(kstStart.getTime() + 24 * 60 * 60 * 1000 - 1);
      
      const { data: existingTxs } = await supabase
        .from("credit_transactions")
        .select("id")
        .eq("user_id", currentUser.id)
        .eq("type", "earned")
        .eq("description", rewardDescription)
        .gte("created_at", kstStart.toISOString())
        .lte("created_at", kstEnd.toISOString());

      if (existingTxs && existingTxs.length > 0) {
        lastProcessedKey.current = (lastProcessedKey.current || '') + `|${today}`;
        checkingReward.current = null;
        return;
      }

      const { error: insertError } = await supabase.from('credit_transactions').insert([{
        user_id: currentUser.id,
        type: 'earned',
        amount: rewardAmount,
        description: rewardDescription
      }]);

      if (insertError) throw insertError;

      const { data: profile } = await supabase.from('profiles').select('credits').eq('id', currentUser.id).maybeSingle();
      const currentCredits = profile?.credits || 0;
      
      const { error: updateError } = await supabase.from('profiles').update({
        credits: currentCredits + rewardAmount
      }).eq('id', currentUser.id);

      if (updateError) console.error("Daily Reward profile update failed:", updateError);

      lastProcessedKey.current = (lastProcessedKey.current || '') + `|${today}`;
      window.dispatchEvent(new Event('credits_updated'));
    } catch (err: any) {
      if (err?.message !== 'Failed to fetch' && err?.message !== 'FetchError') {
        console.error("Daily reward check failed", err);
      }
    } finally {
      checkingReward.current = null;
    }
  };

  const ensureProfileExists = async (currentUser: User) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', currentUser.id)
        .maybeSingle();
      
      if (fetchError && fetchError.message !== 'Failed to fetch' && fetchError.message !== 'FetchError') {
        console.error("Profile check fetch failed:", fetchError);
      }

      if (!data) {
        console.log("Creating new profile for:", currentUser.email);
        
        // Check if there is a referral code in local storage
        let referredBy = null;
        const storedReferralCode = localStorage.getItem('referral_code');
        if (storedReferralCode) {
           const { data: refData } = await supabase.from('profiles').select('id').eq('referral_code', storedReferralCode).single();
           if (refData) referredBy = refData.id;
        }

        // Generate a random referral code using user ID
        const generatedCode = btoa(currentUser.id.replace(/-/g, '')).substring(0, 8).toUpperCase();

        const { error: insertError } = await supabase.from('profiles').upsert({
          id: currentUser.id,
          email: currentUser.email,
          full_name: currentUser.user_metadata?.full_name || '사용자',
          credits: 0,
          referral_code: generatedCode,
          referred_by: referredBy
        }, { onConflict: 'id', ignoreDuplicates: true });
        
        if (insertError) {
           console.error("Profile creation failed:", insertError);
        } else {
           console.log("Profile created successfully");
           if (referredBy) {
               // Create mission
               await supabase.from('referral_missions').insert([{
                 referrer_id: referredBy,
                 referred_id: currentUser.id,
                 status: 'signup'
               }]);
               // Give the referrer their signup credits
               let rewardAmount = 20;
               try {
                 const { data: metrics } = await supabase.from('app_metrics').select('referral_signup_reward').eq('id', 1).single();
                 if (metrics?.referral_signup_reward) rewardAmount = metrics.referral_signup_reward;
               } catch (e: any) {
                 if (e?.message !== 'Failed to fetch' && e?.message !== 'FetchError') {
                   console.error("Failed to fetch referral reward metrics", e);
                 }
               }

               const { data: refUser } = await supabase.from('profiles').select('credits').eq('id', referredBy).single();
               if (refUser) {
                 await supabase.from('profiles').update({ credits: refUser.credits + rewardAmount }).eq('id', referredBy);
                 await supabase.from('credit_transactions').insert([{
                   user_id: referredBy,
                   type: 'earned',
                   amount: rewardAmount,
                   description: '친구 추천 가입 보상'
                 }]);
               }
           }
        }
      }
    } catch (err: any) {
      if (err?.message !== 'Failed to fetch' && err?.message !== 'FetchError') {
        console.error("Profile ensure failed:", err);
      }
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAuthInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        const runRewards = async () => {
          // 1. Ensure profile exists first
          await ensureProfileExists(currentUser);
          // 2. Sequential execution to avoid Race Conditions on 'profiles' update
          await checkWelcomeReward(currentUser);
          await checkDailyReward(currentUser);

          // 3. Log user login history (Phase 3 requirements)
          if (event === 'SIGNED_IN') {
             try {
               await supabase.from('login_histories').insert([{
                 profile_id: currentUser.id,
                 email: currentUser.email,
                 user_agent: navigator.userAgent,
                 ip_address: 'CLIENT_IP_HIDDEN' // Real IP would be best retrieved server-side or via an API edge function.
               }]);
             } catch (e: any) {
               if (e?.message !== 'Failed to fetch' && e?.message !== 'FetchError') {
                 console.error("Login history logging failed:", e);
               }
             }
          }
        };
        runRewards();
      }
    });

    return () => subscription.unsubscribe();
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

  const isSystemAdmin = user?.email === 'cubric.ceo@gmail.com';
  
  if (settings?.parkingPage?.enabled && !isSystemAdmin) {
    return <ParkingPage />;
  }

  return (
    <div className="min-h-screen bg-bg-base transition-colors duration-500">
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      
      {!location.pathname.startsWith('/m/shop') && (
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
        <Route path="/admin/site-editor" element={<SiteEditorPage user={user} />} />
        <Route path="/admin/shop" element={<ShopManagementPage user={user} />} />
        <Route path="/security-admin" element={<SecurityAdminPage user={user} />} />
        <Route path="/cs-admin" element={<CsAdminPage user={user} />} />
        <Route path="/support" element={<SupportPage user={user} />} />
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
        <Route path="/mypage/credits" element={<CreditsPage />} />
        <Route path="/mypage/reports" element={<ReportsPage />} />
        <Route path="/mypage/instagram" element={<InstagramPage />} />
        <Route path="/mypage/marketing" element={<MarketingPage />} />
        <Route path="/mypage/referral" element={<ReferralPage user={user} />} />
      </Routes>
      {!location.pathname.startsWith('/m/shop') && (
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

export default function App() {
  return (
    <SiteProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </SiteProvider>
  );
}

