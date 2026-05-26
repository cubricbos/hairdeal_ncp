import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../supabase';
import { motion } from 'motion/react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const hasAttempted = React.useRef(false);

  useEffect(() => {
    if (hasAttempted.current) return;
    hasAttempted.current = true;

    const confirmPayment = async () => {
      try {
        const paymentKey = searchParams.get('paymentKey');
        const orderId = searchParams.get('orderId');
        const amountStr = searchParams.get('amount');
        
        console.log('Payment params:', { paymentKey, orderId, amountStr });

        if (!paymentKey || !orderId || !amountStr) {
          throw new Error('결제 필수 정보가 누락되었습니다.');
        }

        const amount = parseInt(amountStr, 10);
        if (isNaN(amount)) {
          throw new Error('결제 금액 형식이 올바르지 않습니다.');
        }

        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) {
          throw new Error('로그인이 필요합니다.');
        }

        // 1. Confirm payment via backend
        const response = await fetch(`${window.location.origin}/api/toss-verify-payment?paymentKey=${encodeURIComponent(paymentKey)}&orderId=${encodeURIComponent(orderId)}&amount=${encodeURIComponent(amount.toString())}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });

        console.log('API Response Status:', response.status);
        
        const responseText = await response.text();
        let data: any = null;
        try {
          if (responseText) data = JSON.parse(responseText);
        } catch (e) {
          console.error('Failed to parse response JSON:', responseText);
        }
        
        if (!response.ok) {
           console.error('Payment confirmation failed:', {
             status: response.status,
             statusText: response.statusText,
             data: data,
             raw: responseText
           });

           if (response.status === 405) {
             throw new Error('서버 환경 오류 (405): 이 네트워크나 브라우저에서 결제 승인 요청을 차단했습니다.');
           }
           
           throw new Error(data?.message || data?.error || `결제 승인 실패 (Status: ${response.status})`);
        }

        // 2. Pre-check if already processed
        const { data: existingPayment } = await supabase
          .from('payments')
          .select('id')
          .eq('order_id', orderId)
          .single();

        if (existingPayment) {
          // Already processed, just show success directly
          setStatus('success');
          return;
        }

        // 3. Add credits to profile
        let creditToAdd = 0;
        const parts = orderId.split('_');
        
        if (orderId.includes('credits_') && parts.length >= 2) {
          creditToAdd = parseInt(parts[1], 10);
        } else {
          // Fallback calculation based on amount
          if (amount === 5000) creditToAdd = 50;
          else if (amount === 10000) creditToAdd = 120;
          else if (amount === 50000) creditToAdd = 700;
        }

        if (creditToAdd > 0) {
          const { data: profile } = await supabase.from('profiles').select('credits').eq('id', user.id).single();
          const currentCredits = profile?.credits || 0;
          
          await supabase.from('profiles').update({
            credits: currentCredits + creditToAdd
          }).eq('id', user.id);

          const { error: txError } = await supabase.from('credit_transactions').insert([{
            user_id: user.id,
            type: 'earned',
            amount: creditToAdd,
            description: `크레딧 결제 충전 (${amount.toLocaleString()}원)`
          }]);
          
          if (txError) {
             console.error('TX Insert Error:', txError);
          }

          // Log payment for revenue tracking
          await supabase.from('payments').insert([{
            user_id: user.id,
            amount: amount,
            payment_type: 'credit',
            order_id: orderId
          }]);
        }

        setStatus('success');

      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.message || '알 수 없는 오류가 발생했습니다.');
      }
    };

    confirmPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen pt-32 px-6 flex flex-col items-center text-center">
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-4">
           <Loader2 className="w-12 h-12 animate-spin text-brand-primary" />
           <p className="text-xl font-black">결제를 승인하고 있습니다...</p>
        </div>
      )}
      
      {status === 'success' && (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
           <CheckCircle2 className="w-20 h-20 text-green-500 shadow-xl rounded-full" />
           <p className="text-2xl font-black text-gray-900">결제가 완료되었습니다!</p>
           <p className="text-gray-500 font-medium">크레딧 충전이 완료되었습니다. 확인 버튼을 눌러 확인해주세요.</p>
           <button 
             onClick={() => navigate('/mypage/credits', { replace: true })}
             className="mt-8 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:shadow-xl transition-all active:scale-95"
           >
             확인
           </button>
        </motion.div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-4">
           <XCircle className="w-20 h-20 text-red-500" />
           <p className="text-2xl font-black text-red-500">결제 처리에 실패했습니다.</p>
           <p className="text-gray-500 font-medium">{errorMessage}</p>
           <button 
             onClick={() => navigate('/mypage/credits', { replace: true })}
             className="mt-8 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:shadow-xl transition-all active:scale-95"
           >
             돌아가기
           </button>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccessPage;
