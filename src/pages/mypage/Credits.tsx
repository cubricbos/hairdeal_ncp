import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { Coins, Plus, Minus, History, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../supabase';
import { apiClient, accountClient } from '../../lib/ncpClient';
import { useSiteContext } from '../../context/SiteContext';
import { retryPromise, retrySupabaseSelect, safeSelectWithOrderFallback } from '../../lib/supabase-utils';

interface CreditsPageProps {
  user?: any;
}

const CreditsPage: React.FC<CreditsPageProps> = ({ user }) => {
  const { settings } = useSiteContext();
  const [credits, setCredits] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyRewardAmt, setDailyRewardAmt] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'earned' | 'deducted'>('all');
  const [friendCredits, setFriendCredits] = useState(0);
  const [monthUsedCredits, setMonthUsedCredits] = useState(0);

  const isMounted = useRef(true);
  const lastFetchTime = useRef(0);
  const fetchLock = useRef(false);

  const fetchCreditData = useCallback(async () => {
    // Throttle: don't fetch more than once every 2 seconds unless explicit
    const now = Date.now();
    if (now - lastFetchTime.current < 2000 || fetchLock.current) return;
    
    lastFetchTime.current = now;
    fetchLock.current = true;

    setLoading(true);
    try {
      const { data: metrics } = await retrySupabaseSelect<any>(() => supabase.from('app_metrics').select('daily_credit_reward').eq('id', 1).single() as any);
      if (isMounted.current && metrics && (metrics as any).daily_credit_reward !== undefined) {
        setDailyRewardAmt((metrics as any).daily_credit_reward);
      }

      let userId = user?.id || '';
      let isNcp = false;
      let ncpDesignerId = '';

      const ncpToken = localStorage.getItem('ncp_access_token');
      if (ncpToken) {
        isNcp = true;
        try {
          const payloadPart = ncpToken.split('.')[1];
          const decodedStr = decodeURIComponent(escape(atob(payloadPart)));
          const decoded = JSON.parse(decodedStr);
          ncpDesignerId = decoded.id;
          if (!userId) {
            userId = decoded.id;
            if (userId && !userId.includes('-')) {
               userId = `${userId.substring(0, 8)}-${userId.substring(8, 12)}-${userId.substring(12, 16)}-${userId.substring(16, 20)}-${userId.substring(20)}`;
            }
          }
        } catch (e) {
          console.warn("NCP Parse error in credits page", e);
        }
      }

      if (!userId) {
        const { data: sessionData } = await retryPromise(() => supabase.auth.getSession());
        if (sessionData?.session?.user) {
          userId = sessionData.session.user.id;
        }
      }

      if (!userId) {
        if (isMounted.current) setLoading(false);
        fetchLock.current = false;
        return;
      }

      let currentCredits = 0;
      let matchedFriendCredits = 0;
      let matchedMonthUsedCredits = 0;
      let profileName = '디자이너';
      let profileEmail = 'ncp_user@local.domain';

      // 1. Fetch current credits from Supabase initially
      const { data: profile } = await retrySupabaseSelect<any>(() => supabase
        .from('profiles').select('credits, full_name, email').eq('id', userId).maybeSingle() as any);
      if (profile?.credits !== undefined) currentCredits = profile.credits;
      if (profile?.full_name) profileName = profile.full_name;
      if (profile?.email) profileEmail = profile.email;

      let finalTxs: any[] = [];

      // 1b. If the user is an NCP designer, try to fetch their actual live credits from the NCP server!
      if (isNcp && ncpDesignerId) {
        try {
          console.log("[Credits] Attempting to fetch live credits from NCP summary API...");
          let summaryRes;
          try {
            summaryRes = await apiClient.get('/faceswap/credit');
          } catch (firstErr: any) {
            console.log("[Credits] /faceswap/credit failed, trying /summary fallback...");
            summaryRes = await apiClient.get('/faceswap/credit/summary');
          }

          if (summaryRes.data?.credit !== undefined) {
            currentCredits = summaryRes.data.credit;
            // Keep Supabase profiles table synchronized with these live credits!
            await supabase.from('profiles').update({ credits: currentCredits }).eq('id', userId);
            console.log("[Credits] Obtained live credits from NCP summary API and updated profiles table:", currentCredits);
          } else if (summaryRes.data?.credits !== undefined) {
             currentCredits = summaryRes.data.credits;
             await supabase.from('profiles').update({ credits: currentCredits }).eq('id', userId);
             console.log("[Credits] Obtained live credits from NCP summary API (credits field):", currentCredits);
          }
        } catch (e: any) {
          // If we get a 500, we'll silently fallback to Supabase data without spamming logs too much
          const status = e?.response?.status;
          if (status === 500) {
             console.warn('[Credits] NCP summary API returned 500, silent fallback to Supabase.');
          } else {
             console.warn('[Credits] summary API failed, using Supabase fallback:', e.message || e);
          }
        }
      }

      // 2. Fetch history (Prefer apiClient /faceswap/credit/history first, fallback to accountClient)
      let ncpTxs: any[] | null = null;
      if (isNcp && ncpDesignerId) {
        const clientLoaders = [
          {
            name: 'apiClient /faceswap/credit/history',
            path: '/faceswap/credit/history',
            loader: () => Promise.resolve(apiClient),
          },
          {
            name: 'accountClient /faceswap/credit/history',
            path: '/faceswap/credit/history',
            loader: () => import('../../lib/ncpClient').then(m => m.accountClient),
          }
        ];

        for (const { name, path, loader } of clientLoaders) {
          try {
            const client = await loader();
            let allNcpTxs: any[] = [];
            let currentPage = 1;
            let keepFetching = true;

            while (keepFetching) {
              const res = await client.get(path, {
                params: { month: 12, filter: 'ALL', pageNo: currentPage, pageSize: 50 }
              });

              // Also check for standard Spring page structure (items may be root, or under content, items, or data)
              const payload = res.data;
              const items: any[] = typeof payload === 'object' && !Array.isArray(payload) ? (payload.items || payload.content || payload.data || []) : payload || [];
              const totalCount: number = payload?.totalCount ?? payload?.totalElements ?? payload?.total_count ?? items.length;

              if (items.length === 0) {
                keepFetching = false;
              } else {
                allNcpTxs = [...allNcpTxs, ...items];
                keepFetching = allNcpTxs.length < totalCount && items.length > 0;
                currentPage++;
              }
              
              if (currentPage > 20) keepFetching = false; // Safety break
            }

            if (allNcpTxs.length > 0) {
              ncpTxs = allNcpTxs;
              console.log(`[Credit] history fetched via ${name}, count: ${ncpTxs.length}`);
              break; // Stop on first successful fetch
            }
          } catch (e: any) {
            console.log(`[Credit] history api not available on ${name} (${e?.response?.status || 404}).`);
          }
        }
      }

      if (ncpTxs && Array.isArray(ncpTxs) && ncpTxs.length > 0) {
         const getCreditTypeDescription = (type: string, amount: number) => {
           const map: Record<string, string> = {
             CHARGE: '크레딧 충전',
             MEMBERSHIP_BONUS: '멤버십 가입 보너스',
             REFERRAL: '친구 추천 보상',
             SIGNUP: '신규 가입 보상',
             DAILY: '출석 보상',
             AI_FACE_SWAP: 'AI 얼굴 합성 사용',
             AI_FACE_SWAP_MEMBERSHIP: 'AI 얼굴 합성 (멤버십)',
             AI_VIDEO: 'AI 영상 생성 사용',
             AI_VIDEO_MEMBERSHIP: 'AI 영상 생성 (멤버십)',
             REFUND_AI_FACE_SWAP: 'AI 얼굴 합성 환불',
             REFUND_AI_FACE_SWAP_MEMBERSHIP: 'AI 얼굴 합성 환불 (멤버십)',
             REFUND_AI_VIDEO: 'AI 영상 생성 환불',
             REFUND_AI_VIDEO_MEMBERSHIP: 'AI 영상 생성 환불 (멤버십)',
             REVOKE_MEMBERSHIP_CREDIT: '멤버십 크레딧 회수'
           };
           return map[type] || (amount > 0 ? '크레딧 적립' : '크레딧 차감');
         };

         if (ncpTxs[0]?.afterBalance !== undefined) {
            currentCredits = ncpTxs[0].afterBalance;
            supabase.from('profiles').update({ credits: currentCredits }).eq('id', userId).then();
         }

         finalTxs = ncpTxs.map((t: any) => ({
            id: t.id ?? Math.random().toString(),
            type: (t.amount > 0) ? 'earned' : 'deducted',
            _originalType: t.type,
            amount: Math.abs(t.amount ?? 0),
            description: t.description || getCreditTypeDescription(t.type, t.amount),
            date: t.createdAt ?? new Date().toISOString(),
            expireDate: t.expiredAt ?? null,
            isExpired: t.isExpired ?? false,
            status: 'Success'
         }));
         
         // Add to finalTxs array properly
         finalTxs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      } else {
        // Fallback to Supabase
        const { data: txs } = await safeSelectWithOrderFallback(
          supabase.from('credit_transactions'),
          '*',
          'created_at', // try sorting by created_at first
          (q) => q.eq('user_id', userId)
        );
            
         let dbTxs = txs ? (txs as any[]).map(t => ({
           id: t.id,
           type: t.type === 'earned' || t.type === 'earned_welcome' || t.type === 'earned_daily' ? 'earned' : (t.type === 'deducted' ? 'deducted' : t.type),
           amount: t.amount,
           description: t.description,
           date: t.created_at,
           expireDate: null,
           status: 'Success'
         })) : [];

         // Retrieve offline fallbacks from localStorage
         let localTxs: any[] = [];
         try {
            const localKey = `local_txs_${userId}`;
            const localStr = localStorage.getItem(localKey);
            if (localStr) {
               const parsed = JSON.parse(localStr);
               localTxs = parsed.map((t: any) => ({
                 id: t.id || 'local_' + Math.random().toString(),
                 type: t.type === 'earned' ? 'earned' : (t.type === 'deducted' ? 'deducted' : t.type),
                 amount: Math.abs(t.amount || 0),
                 description: t.description,
                 date: t.created_at || new Date().toISOString(),
                 expireDate: null,
                 status: 'Success'
               }));
            }
         } catch (localErr) {
            console.warn("Credits: Fail parse local transactions", localErr);
         }

         // Combine both arrays
         const combined = [...dbTxs];
         
         // Add local ones if they don't already exist with similar description within 1 hour window
         localTxs.forEach((lTx: any) => {
            const alreadyExists = combined.some((cTx: any) => 
               cTx.description === lTx.description && 
               Math.abs(new Date(cTx.date).getTime() - new Date(lTx.date).getTime()) < 3600000 // within 1 hour
            );
            if (!alreadyExists) {
               combined.push(lTx);
            }
         });

         // Sort combined transactions descending
         combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
         finalTxs = combined;
       }

      // Calculate month used credits from history (excluding refunds/revokes)
      if (finalTxs.length > 0) {
         const EXCLUDED_TYPES = new Set([
           'REFUND_AI_FACE_SWAP',
           'REFUND_AI_FACE_SWAP_MEMBERSHIP',
           'REFUND_AI_VIDEO',
           'REFUND_AI_VIDEO_MEMBERSHIP',
           'REVOKE_MEMBERSHIP_CREDIT',
         ]);
         const now = new Date();
         const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
         matchedMonthUsedCredits = finalTxs.filter(t => {
            const tDate = new Date(t.date);
            return t.type === 'deducted' 
               && tDate >= firstDayOfMonth
               && !EXCLUDED_TYPES.has(t._originalType);
         }).reduce((sum, t) => sum + t.amount, 0);
      }
      
      // Calculate friend credits from history using REFERRAL type
      if (finalTxs.length > 0) {
         matchedFriendCredits = finalTxs.filter(t => 
            t._originalType === 'REFERRAL'
         ).reduce((sum, t) => sum + t.amount, 0);
      }

      setTransactions(finalTxs.map(t => {
         // Determine KST or UTC formatted date safely
         let formattedDateString = '';
         try {
            if (t.date) {
               formattedDateString = t.date.includes('T') ? t.date.split('T')[0] : t.date.slice(0, 10);
            }
         } catch (e) {
            formattedDateString = new Date().toISOString().split('T')[0];
         }
         return {
            ...t,
            formattedDate: formattedDateString || new Date().toISOString().split('T')[0]
         };
      }));
      if (isMounted.current) {
        setCredits(Math.max(0, currentCredits));
        setFriendCredits(matchedFriendCredits);
        setMonthUsedCredits(matchedMonthUsedCredits);
      }
    } catch (err) {
      console.error('크레딧 조회 실패:', err);
    } finally {
      if (isMounted.current) setLoading(false);
      fetchLock.current = false;
    }
  }, [user]);

  useEffect(() => {
    isMounted.current = true;
    fetchCreditData();

    // Set up Realtime subscription for real-time updates when admin adjusts credits
    let profileSub: any = null;
    let txSub: any = null;

    const setupSubscriptions = async () => {
      let userId = user?.id || '';
      if (!userId) {
        const ncpToken = localStorage.getItem('ncp_access_token');
        if (ncpToken) {
          try {
            const payloadPart = ncpToken.split('.')[1];
            const decodedStr = decodeURIComponent(escape(atob(payloadPart)));
            const decoded = JSON.parse(decodedStr);
            userId = decoded.id;
            if (userId && !userId.includes('-')) {
               userId = `${userId.substring(0, 8)}-${userId.substring(8, 12)}-${userId.substring(12, 16)}-${userId.substring(16, 20)}-${userId.substring(20)}`;
            }
          } catch (e) {
            console.warn("NCP Parse error in setupSubscriptions", e);
          }
        }
      }

      if (!userId) {
        const { data: sessionData } = await retryPromise(() => supabase.auth.getSession());
        if (sessionData?.session?.user) {
          userId = sessionData.session.user.id;
        }
      }

      if (!userId || !isMounted.current) return;

      // Subscribe to profile changes (for balance)
      const profileChannel = supabase
        .channel(`profiles_${userId}_credits_${Math.random().toString(36).substring(7)}`)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles',
          filter: `id=eq.${userId}`
        }, (payload) => {
          if (isMounted.current && payload.new && payload.new.credits !== undefined) {
            setCredits(payload.new.credits);
          }
        });
      
      profileSub = profileChannel.subscribe();

      // Subscribe to transaction changes (for history)
      const txChannel = supabase
        .channel(`transactions_${userId}_credits_${Math.random().toString(36).substring(7)}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'credit_transactions',
          filter: `user_id=eq.${userId}`
        }, () => {
          // Re-fetch everything to ensure sync and calculation consistency
          fetchCreditData();
        });

      txSub = txChannel.subscribe();
    };

    setupSubscriptions();

    return () => {
      isMounted.current = false;
      if (profileSub) supabase.removeChannel(profileSub);
      if (txSub) supabase.removeChannel(txSub);
    };
  }, [user, fetchCreditData]);

  const rechargeOptions = [
    { amount: 50, price: '5,000원', numericPrice: 5000, popular: false },
    { amount: 120, price: '10,000원', numericPrice: 10000, popular: true },
    { amount: 700, price: '50,000원', numericPrice: 50000, popular: false },
  ];

  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleRecharge = async (amount: number, priceStr: string) => {
    try {
      const { data: sessionData } = await retryPromise(() => supabase.auth.getSession());
      const userData = { user: sessionData?.session?.user };
      if (!userData?.user) {
        alert('로그인이 필요합니다.');
        return;
      }
      const userId = userData.user.id;
      const userEmail = userData.user.email || 'customer@example.com';
      const numericPrice = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
      const orderId = `credits_${amount}_${new Date().getTime()}`;

      // Get client key from site settings
      const { data: settings } = await retrySupabaseSelect<any>(() => supabase.from('site_settings').select('toss_client_key').eq('id', 'default').single() as any);
      const actualClientKey = ((settings as any)?.toss_client_key || 'test_ck_OEP59LybZ8BdLw0m02vwRV6GdA4P').trim();

      // Check if user has billing key
      const { data: profile } = await retrySupabaseSelect<any>(() => supabase.from('profiles').select('billing_key, full_name').eq('id', userId).single() as any);
      
      let targetBillingKey = (profile as any)?.billing_key;
      // Check if there's a billing record in a separate table (Flutter integration)
      try {
        const { data: billingData } = await retrySupabaseSelect<any>(() => supabase
          .from('billing')
          .select('billing_key')
          .eq('designer_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single() as any);
          
        if (billingData?.billing_key) {
          targetBillingKey = billingData.billing_key;
        }
      } catch(e) {
         // Fallback
      }

      const useBillingKey = targetBillingKey && window.confirm('등록된 카드로 즉시 결제하시겠습니까? (취소를 누르면 새로 결제창이 열립니다)');

      setProcessingId(amount.toString());

      if (useBillingKey) {
        // 1. Process with billing key
        const response = await fetch('/api/toss/billing/pay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            billingKey: targetBillingKey,
            customerKey: userId.replace(/[^a-zA-Z0-9_\-=]/g, '').substring(0, 50),
            amount: numericPrice,
            orderId,
            orderName: `CUBRIC 크레딧 충전 (${amount}C)`,
            customerEmail: userEmail
          })
        });

        let paymentData;
        const responseText = await response.text();
        try {
          paymentData = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
          throw new Error('서버 오류: 올바른 JSON 응답이 아닙니다.');
        }
        if (!response.ok) {
          throw new Error(paymentData.message || '결제 처리에 실패했습니다.');
        }

        // Add credits
        await addCredits(userId, amount, numericPrice);
        alert(`성공적으로 결제가 완료되었습니다! (+${amount}C)`);
        fetchCreditData();
      } else {
        // 2. Process with standard payment window (One-time)
        const { loadTossPayments } = await import('@tosspayments/tosspayments-sdk');
        const tossPayments = await loadTossPayments(actualClientKey);
        
        // V2 SDK requestPayment
        // NOTE: We use window.location.origin for success/fail URLs
        await tossPayments.payment({
          customerKey: userId.replace(/[^a-zA-Z0-9_\-=]/g, '').substring(0, 50),
        }).requestPayment({
          method: "CARD",
          amount: { currency: "KRW", value: numericPrice },
          orderId,
          orderName: `CUBRIC 크레딧 충전 (${amount}C)`,
          successUrl: window.location.origin + "/payment/success",
          failUrl: window.location.origin + "/payment/fail",
          customerEmail: userEmail,
          customerName: (profile as any)?.full_name || userEmail.split('@')[0] || '사용자'
        });
      }
    } catch (err: any) {
      console.warn('충전 정보:', err);
      if (err?.code !== 'USER_CANCEL') {
        alert(`결제 및 충전 실패: ${err.message}`);
      }
    } finally {
      if (isMounted.current) setProcessingId(null);
    }
  };

  const addCredits = async (userId: string, amount: number, price: number) => {
    // 2. 크레딧 내역 기록
    const { error: txError } = await supabase.from('credit_transactions').insert([{
      user_id: userId,
      type: 'earned',
      amount: amount,
      description: `크레딧 결제 충전 (${price.toLocaleString()}원)`
    }]);
    
    if (txError) {
      console.error('Credits TX Insert Error:', txError);
      if (txError.code === '42501') {
         try {
            const key = `local_txs_${userId}`;
            const current = localStorage.getItem(key);
            const list = current ? JSON.parse(current) : [];
            list.unshift({
               id: 'local_' + Math.random().toString(36).substring(2, 11),
               type: 'earned',
               amount: amount,
               description: `크레딧 결제 충전 (${price.toLocaleString()}원)`,
               created_at: new Date().toISOString()
            });
            localStorage.setItem(key, JSON.stringify(list));
         } catch (e) {
            console.warn("Failed to write to local storage transaction log", e);
         }
      }
    }

    // 3. 보유 크레딧 업데이트
    const { data: latestProfile } = await retrySupabaseSelect<any>(() => supabase.from('profiles').select('credits').eq('id', userId).single() as any);
    const currentDBCredits = (latestProfile as any)?.credits ?? 0;
    const newCredits = currentDBCredits + amount;
    
    await supabase.from('profiles').update({ credits: newCredits }).eq('id', userId);

    // 4. Log payment for revenue tracking (actual revenue)
    await supabase.from('payments').insert([{
      user_id: userId,
      amount: price,
      payment_type: 'credit',
      order_id: `credits_${userId}_${Date.now()}`
    }]);

    window.dispatchEvent(new Event('credits_updated'));
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">크레딧 관리</h1>
            <p className="text-gray-500 font-medium tracking-tight">현재 보유한 크레딧과 이용 내역을 확인하세요</p>
          </div>
        </div>

        {/* Current Credits */}
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Coins className="w-8 h-8 text-indigo-300" />
                <h2 className="text-lg font-bold text-indigo-100">총 보유 크레딧</h2>
              </div>
              {loading ? (
                <div className="h-12 w-32 bg-white/10 animate-pulse rounded-lg mt-2"></div>
              ) : (
                <p className="text-5xl font-black tracking-tight">{credits.toLocaleString()} <span className="text-xl font-medium text-indigo-200 tracking-normal">C</span></p>
              )}
            </div>
            
            <div className="flex gap-4 sm:gap-8 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-indigo-700/50 md:border-none">
              <div className="flex-1 md:flex-none">
                <h3 className="text-indigo-200 text-sm font-medium mb-1">친구 누적 크레딧</h3>
                {loading ? (
                   <div className="h-6 w-20 bg-white/10 animate-pulse rounded-lg mt-1"></div>
                ) : (
                   <div className="text-2xl font-bold">{friendCredits.toLocaleString()} <span className="text-sm font-medium text-indigo-200">C</span></div>
                )}
              </div>
              <div className="w-px bg-indigo-700/50 hidden md:block"></div>
              <div className="flex-1 md:flex-none">
                <h3 className="text-indigo-200 text-sm font-medium mb-1">이달 사용 크레딧</h3>
                {loading ? (
                   <div className="h-6 w-20 bg-white/10 animate-pulse rounded-lg mt-1"></div>
                ) : (
                   <div className="text-2xl font-bold">{monthUsedCredits.toLocaleString()} <span className="text-sm font-medium text-indigo-200">C</span></div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recharge Options */}
        {settings.creditSettings?.chargeOptionsEnabled && (
          <div className="mt-12">
            <h3 className="text-xl font-black text-gray-900 mb-6">크레딧 충전</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {rechargeOptions.map((option, idx) => (
                <div 
                  key={idx} 
                  className={`bg-white rounded-2xl p-6 border-2 transition-all hover:shadow-lg ${option.popular ? 'border-brand-primary/50 relative' : 'border-gray-100'}`}
                >
                  {option.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                      Most Popular
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <Coins className={`w-8 h-8 mx-auto mb-3 ${option.popular ? 'text-brand-primary' : 'text-gray-400'}`} />
                    <p className="text-2xl font-black text-gray-900">{option.amount} <span className="text-sm font-bold text-gray-500">C</span></p>
                    <p className="text-lg font-bold text-brand-primary mt-2">{option.price}</p>
                  </div>
                  <button 
                    onClick={() => handleRecharge(option.amount, option.price)}
                    disabled={loading || processingId !== null}
                    className={`w-full py-3 rounded-xl font-bold transition-transform active:scale-95 flex items-center justify-center gap-2 ${
                      option.popular ? 'bg-brand-primary text-white hover:bg-brand-primary/90' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    } ${processingId === option.amount.toString() ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    {processingId === option.amount.toString() ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    {processingId === option.amount.toString() ? '결제 중...' : '충전하기'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden mt-8">
          <div className="px-8 py-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-bold text-gray-900">사용 내역</h2>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl">
              <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>전체내역</button>
              <button onClick={() => setActiveTab('earned')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'earned' ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>적립내역</button>
              <button onClick={() => setActiveTab('deducted')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'deducted' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>차감내역</button>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="p-8 text-center text-gray-500">불러오는 중...</div>
            ) : transactions.filter(t => activeTab === 'all' || t.type === activeTab).length === 0 ? (
              <div className="p-8 text-center text-gray-500">크레딧 사용 내역이 없습니다.</div>
            ) : (
              transactions.filter(t => activeTab === 'all' || t.type === activeTab).map((t) => (
                <div key={t.id} className="px-8 py-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${t.type === 'earned' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                      {t.type === 'earned' ? <Plus className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{t.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-gray-500">{t.formattedDate}</p>
                        {t.type === 'earned' && t.expireDate && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.isExpired ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                            {t.isExpired ? '만료됨' : `유효기간: ${new Date(new Date(t.expireDate).getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0]}까지`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-lg ${t.type === 'earned' ? 'text-green-500' : 'text-red-500'}`}>
                      {t.type === 'earned' ? '+' : '-'}{t.amount.toLocaleString()} C
                    </p>
                    <p className="text-xs font-bold text-gray-400 flex items-center justify-end gap-1 mt-1">
                       <CheckCircle2 className="w-3 h-3"/>{t.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default CreditsPage;
