import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Zap, Crown, Star, Loader2 } from 'lucide-react';
import { supabase } from '../../supabase';
import { useNavigate } from 'react-router-dom';
import { useSiteContext } from '../../context/SiteContext';

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSiteContext();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const pricing = settings?.pricing || { plans: [], yearlyBillingEnabled: false, yearlyDiscountRate: 0 };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const ncpToken = localStorage.getItem('ncp_access_token');
    
    // Support NCP User Token parsing
    if (ncpToken) {
      try {
        const payloadPart = ncpToken.split('.')[1];
        const decodedStr = decodeURIComponent(escape(atob(payloadPart)));
        const decoded = JSON.parse(decodedStr);
        let fullUuid = decoded.id;
        if (fullUuid && !fullUuid.includes('-')) {
           fullUuid = `${fullUuid.substring(0, 8)}-${fullUuid.substring(8, 12)}-${fullUuid.substring(12, 16)}-${fullUuid.substring(16, 20)}-${fullUuid.substring(20)}`;
        }

        try {
          let { data, error } = await supabase.from('profiles').select('*').eq('id', fullUuid).maybeSingle();
          if (!data && decoded.email) {
            const { data: emailData } = await supabase.from('profiles').select('*').eq('email', decoded.email).maybeSingle();
            if (emailData) data = emailData;
          }
          if (data) {
             setProfile(data);
             setLoading(false);
             return;
          }
        } catch (supabaseErr) {
          console.warn("Supabase query error in subscription search:", supabaseErr);
        }

        // Fallback if not flushed to Supabase yet or if RLS error occurred
        setProfile({
           id: fullUuid,
           email: decoded.email || 'user@ncp.local',
           full_name: decoded.name || '디자이너',
           subscription_plan: 'Free',
           subscription_status: 'active',
           billing_key: null,
           subscription_end_date: null
        });
        setLoading(false);
        return;
      } catch(e) {
        console.warn("NCP Parse error in subscription page", e);
      }
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (user) {
        try {
          const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
          if (data) {
             setProfile(data);
          } else {
             // Fallback profile if row doesn't exist
             setProfile({
                id: user.id,
                email: user.email || 'user@example.com',
                full_name: '사용자',
                subscription_plan: 'Free',
                subscription_status: 'active',
                billing_key: null,
                subscription_end_date: null
             });
          }
        } catch (dbErr) {
          console.warn("Database error in reading fallback, defaulting mock properties", dbErr);
          setProfile({
             id: user.id,
             email: user.email || 'customer@example.com',
             full_name: '테스트 원장님 (Mock)',
             subscription_plan: 'Business',
             subscription_status: 'active',
             billing_key: 'mock_billing_key_123',
             subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      }
    } catch (sessionErr) {
       console.warn("Auth session fetch error", sessionErr);
    }
    setLoading(false);
  };

  const handleSubscribe = async (plan: any, amount: number) => {
    if (!profile) return alert('로그인이 필요합니다.');
    if (plan.name.toUpperCase() === 'FREE') return; // Cannot downgrade to free this way
    
    setProcessing(true);
    let targetBillingKey = profile.billing_key;
    
    // Check if there's a billing record in a separate table (Flutter integration)
    try {
      const { data: billingData } = await supabase
        .from('billing')
        .select('billing_key')
        .eq('designer_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (billingData?.billing_key) {
        targetBillingKey = billingData.billing_key;
      }
    } catch(e) {
       // Table might not exist yet, fallback to profile.billing_key
    }

    if (!targetBillingKey) {
      setProcessing(false);
      const confirm = window.confirm('결제 수단이 등록되어 있지 않습니다. 카드 등록 페이지로 이동하시겠습니까?');
      if (confirm) navigate('/mypage/billing');
      return;
    }

    try {
      const orderId = `order_${new Date().getTime()}_${Math.floor(Math.random()*1000)}`;
      
      const response = await fetch('/api/toss/billing/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billingKey: targetBillingKey,
          customerKey: profile.id.replace(/[^a-zA-Z0-9_\-=]/g, '').substring(0, 50) || "ANONYMOUS",
          amount,
          orderId,
          orderName: `HAIR_DEAL ${plan.name} 플랜 구독`,
          customerEmail: profile.email || 'customer@example.com'
        })
      });

      let data;
      const responseText = await response.text();
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        throw new Error('서버 오류: 올바른 JSON 응답이 아닙니다.');
      }
      if (!response.ok) {
        throw new Error(data.message || data.error || '결제 처리에 실패했습니다.');
      }

      // Update subscription info in profile
      const nextBillingDate = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString();
      const { error: updateError } = await supabase.from('profiles').update({
        subscription_plan: plan.name,
        subscription_status: 'active',
        subscription_end_date: nextBillingDate
      }).eq('id', profile.id);

      if (updateError) throw updateError;

      // Auto-subscription info for Cron Scheduler
      try {
        await supabase.from('user_subscriptions').insert([{
          user_id: profile.id,
          plan_name: plan.name,
          amount: Math.round(amount),
          status: 'active',
          next_billing_date: nextBillingDate,
          last_billing_date: new Date().toISOString(),
          auto_renew: true
        }]);
      } catch (subErr) {
        console.error("Auto subscription logging failed (user_subscriptions table may not exist yet).", subErr);
      }

      // Log payment for revenue tracking
      await supabase.from('payments').insert([{
        user_id: profile.id,
        amount,
        payment_type: 'subscription',
        order_id: orderId,
        plan_name: plan.name
      }]);

      alert(`${plan.name} 플랜 구독이 시작되었습니다! (${data.totalAmount}원)`);
      // Update local UI
      setProfile({ 
        ...profile, 
        subscription_plan: plan.name,
        subscription_status: 'active'
      });

    } catch (err: any) {
      console.error(err);
      alert(`결제 오류: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const plans = (settings?.pricing?.plans || []).filter((p: any) => !p.hidden);
  // Default to a 0-price plan if no plan is specified, or the first available plan
  const defaultPlanName = plans.find(p => p.monthlyPrice === 0)?.name || plans[0]?.name || '';
  const currentPlanName = profile?.subscription_plan || defaultPlanName;

  if (loading) {
    return <div className="pt-32 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">구독 관리</h1>
        <p className="text-gray-500 font-medium mb-8">원장님의 비즈니스 규모에 맞는 최적의 플랜을 선택하세요</p>
        
        {pricing.yearlyBillingEnabled && (
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm font-bold ${!isYearly ? 'text-gray-900' : 'text-gray-400'}`}>월 결제</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-200 transition-colors focus:outline-none"
              style={{ backgroundColor: isYearly ? 'var(--color-brand-primary, #6366f1)' : '#e5e7eb' }}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isYearly ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
            <span className={`text-sm font-bold flex items-center gap-2 ${isYearly ? 'text-gray-900' : 'text-gray-400'}`}>
              연 결제
              {pricing.yearlyDiscountRate > 0 && (
                <span className="bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">
                  {pricing.yearlyDiscountRate}% 할인
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, idx) => {
          const isCurrent = currentPlanName.toUpperCase() === plan.name.toUpperCase();
          const isPopular = plan.isPopular;
          
          const hasIndividualDiscount = (plan.individualDiscountEnabled ?? true) && plan.individualDiscountRate > 0;
          const actualPrice = plan.monthlyPrice * (1 - (hasIndividualDiscount ? (plan.individualDiscountRate / 100) : 0));
          const rawDisplayPrice = isYearly && pricing.yearlyBillingEnabled
            ? ((plan.applyIndividualDiscountToYearly && hasIndividualDiscount) ? actualPrice : plan.monthlyPrice) * 12 * (1 - (pricing.yearlyDiscountRate / 100))
            : actualPrice;
          const displayPrice = Math.round(rawDisplayPrice / 1000) * 1000;
          
          return (
          <motion.div 
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`relative p-8 rounded-[32px] border-2 flex flex-col transition-all duration-500 ${
              isCurrent 
              ? 'border-brand-primary bg-brand-primary/[0.03] shadow-2xl scale-[1.03] z-10' 
              : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'
            }`}
          >
            {isCurrent && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-primary text-white px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.15em] shadow-xl whitespace-nowrap z-20 animate-in fade-in zoom-in duration-500">
                현재 이용 중
              </div>
            )}
            {!isCurrent && isPopular && plan.popularText && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg whitespace-nowrap z-20">
                {plan.popularText}
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="text-2xl font-black text-gray-900 mb-1">{plan.name}</h3>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-wide">{plan.subtitle}</p>
            </div>

            <div className="mb-6 flex flex-col">
              {hasIndividualDiscount && (!isYearly || !pricing.yearlyBillingEnabled || plan.applyIndividualDiscountToYearly) && (
                 <span className="text-sm font-bold text-red-500 mb-1">{plan.individualDiscountRate}% 할인 프로모션</span>
              )}
              <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold text-gray-900">₩{displayPrice.toLocaleString()}</span>
                  <span className="text-gray-500 font-bold text-sm mb-1">/{isYearly && pricing.yearlyBillingEnabled ? '연' : '월'}</span>
              </div>
              {((hasIndividualDiscount && (!isYearly || !pricing.yearlyBillingEnabled || plan.applyIndividualDiscountToYearly)) || (isYearly && pricing.yearlyBillingEnabled && pricing.yearlyDiscountRate > 0)) && (
                 <span className="text-gray-400 text-sm line-through mt-1">₩{(isYearly && pricing.yearlyBillingEnabled ? plan.monthlyPrice * 12 : plan.monthlyPrice).toLocaleString()}</span>
              )}
            </div>
            
            <div className="space-y-4 mb-10 flex-1">
              {plan.features.map((feature, fIdx) => (
                <div key={feature.id} className="flex items-start gap-3">
                  <div className={`mt-1 p-1 rounded-full ${isCurrent ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-sm font-bold text-gray-700 leading-snug">{feature.text}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => handleSubscribe(plan, displayPrice)}
              disabled={isCurrent || processing}
              className={`w-full py-4 rounded-2xl font-black transition-all ${
                isCurrent 
                ? 'bg-gray-200 text-gray-500 cursor-default' 
                : 'bg-brand-primary text-white hover:shadow-xl hover:shadow-brand-primary/20 active:scale-95'
              } ${(processing) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {processing && !isCurrent ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : isCurrent ? '이용 중인 플랜' : '플랜 변경하기'}
            </button>
          </motion.div>
        )})}
      </div>
    </div>
  );
};

export default SubscriptionPage;
