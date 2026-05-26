import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Coins, Plus, History, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../supabase';

const CreditsPage: React.FC = () => {
  const [credits, setCredits] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyRewardAmt, setDailyRewardAmt] = useState(0);

  useEffect(() => {
    fetchCreditData();

    // Set up Realtime subscription for real-time updates when admin adjusts credits
    let profileSub: any = null;
    let txSub: any = null;

    const setupSubscriptions = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userData = { user: session?.user };
      if (!userData?.user) return;

      const userId = userData.user.id;

      // Subscribe to profile changes (for balance)
      const profileChannel = supabase
        .channel(`profiles_${userId}_credits_${Math.random().toString(36).substring(7)}`)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles',
          filter: `id=eq.${userId}`
        }, (payload) => {
          if (payload.new && payload.new.credits !== undefined) {
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
      if (profileSub) supabase.removeChannel(profileSub);
      if (txSub) supabase.removeChannel(txSub);
    };
  }, []);

  const fetchCreditData = async () => {
    setLoading(true);
    try {
      const { data: metrics } = await supabase.from('app_metrics').select('daily_credit_reward').eq('id', 1).single();
      if (metrics && metrics.daily_credit_reward !== undefined) {
        setDailyRewardAmt(metrics.daily_credit_reward);
      }

      const { data: { session }, error: authError } = await supabase.auth.getSession();
      const userData = { user: session?.user };
      if (authError || !userData?.user) return;

      const userId = userData.user.id;

      let currentCredits = 0;
      // 1. 프로필 테이블에서 현재 보유 크레딧 가져오기
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();
      
      if (profile && profile.credits !== undefined) {
        currentCredits = profile.credits;
      }

      // 2. 크레딧 트랜잭션 내역 가져오기
      const { data: txs } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (txs) {
        setTransactions(txs.map(t => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          description: t.description,
          date: new Date(new Date(t.created_at).getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'Success'
        })));
      }
      setCredits(Math.max(0, currentCredits));
    } catch (err) {
      console.error('크레딧 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const rechargeOptions = [
    { amount: 50, price: '5,000원', numericPrice: 5000, popular: false },
    { amount: 120, price: '10,000원', numericPrice: 10000, popular: true },
    { amount: 700, price: '50,000원', numericPrice: 50000, popular: false },
  ];

  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleRecharge = async (amount: number, priceStr: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userData = { user: session?.user };
      if (!userData?.user) {
        alert('로그인이 필요합니다.');
        return;
      }
      const userId = userData.user.id;
      const userEmail = userData.user.email || 'customer@example.com';
      const numericPrice = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
      const orderId = `credits_${amount}_${new Date().getTime()}`;

      // Get client key from site settings
      const { data: settings } = await supabase.from('site_settings').select('toss_client_key').eq('id', 'default').single();
      const actualClientKey = (settings?.toss_client_key || 'test_ck_OEP59LybZ8BdLw0m02vwRV6GdA4P').trim();

      // Check if user has billing key
      const { data: profile } = await supabase.from('profiles').select('billing_key, full_name').eq('id', userId).single();
      
      let targetBillingKey = profile?.billing_key;
      // Check if there's a billing record in a separate table (Flutter integration)
      try {
        const { data: billingData } = await supabase
          .from('billing')
          .select('billing_key')
          .eq('designer_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
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
          customerName: profile?.full_name || userEmail.split('@')[0] || '사용자'
        });
      }
    } catch (err: any) {
      console.warn('충전 정보:', err);
      if (err?.code !== 'USER_CANCEL') {
        alert(`결제 및 충전 실패: ${err.message}`);
      }
    } finally {
      setProcessingId(null);
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
    }

    // 3. 보유 크레딧 업데이트
    const { data: latestProfile } = await supabase.from('profiles').select('credits').eq('id', userId).single();
    const currentDBCredits = latestProfile?.credits ?? 0;
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
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Coins className="w-8 h-8 text-indigo-300" />
                <h2 className="text-lg font-bold text-indigo-100">보유 크레딧</h2>
              </div>
              {loading ? (
                <div className="h-12 w-32 bg-white/10 animate-pulse rounded-lg mt-2"></div>
              ) : (
                <p className="text-5xl font-black tracking-tight">{credits.toLocaleString()} <span className="text-xl font-medium text-indigo-200 tracking-normal">Credits</span></p>
              )}
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-indigo-200 mb-1">매일 로그인 시 <strong className="text-white">'{dailyRewardAmt}'</strong> 크레딧이 출석 보상으로 지급됩니다</p>
            </div>
          </div>
        </div>

        {/* Recharge Options */}
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

        {/* Transaction History */}
        <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden mt-8">
          <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-3">
            <History className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900">사용 내역</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="p-8 text-center text-gray-500">불러오는 중...</div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">크레딧 사용 내역이 없습니다.</div>
            ) : (
              transactions.map((t) => (
                <div key={t.id} className="px-8 py-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${t.type === 'earned' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                      {t.type === 'earned' ? <Plus className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{t.description}</p>
                      <p className="text-sm text-gray-500">{t.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-lg ${t.type === 'earned' ? 'text-green-500' : 'text-gray-900'}`}>
                      {t.type === 'earned' ? '+' : '-'}{t.amount}
                    </p>
                    <p className="text-xs font-bold text-gray-400 flex items-center justify-end gap-1"><CheckCircle2 className="w-3 h-3"/>{t.status}</p>
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
