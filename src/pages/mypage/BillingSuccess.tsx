import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../supabase';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

const BillingSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const processBillingAuth = async () => {
      try {
        const authKey = searchParams.get('authKey');
        const customerKey = searchParams.get('customerKey');
        
        if (!authKey || !customerKey) {
          throw new Error('인증 정보가 비어있습니다.');
        }

        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) {
          throw new Error('로그인이 필요합니다.');
        }

        // 1. Send authKey and customerKey to backend to issue a billingKey
        const response = await fetch('/api/toss/billing/authorizations/issue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ authKey, customerKey }),
        });

        let data;
        const responseText = await response.text();
        try {
          data = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
          throw new Error('서버 오류: 올바른 JSON 응답이 아닙니다.');
        }

        if (!response.ok) {
           throw new Error(data.message || '결제 수단 등록 실패');
        }

        // data.billingKey, data.cardCompany, data.cardNumber
        const { billingKey, cardCompany, cardNumber, method, card } = data;

        // 2. Save billing key and card info to Supabase profiles
        const { error: dbError } = await supabase.from('profiles').update({
           billing_key: billingKey,
           card_company: cardCompany || card?.issuerCode || 'Card',
           card_number: cardNumber || card?.number || '****'
        }).eq('id', user.id);

        if (dbError) {
          throw dbError;
        }

        // 3. Save to billing table (Flutter Integration map)
        try {
          await supabase.from('billing').insert([{
            designer_id: user.id,
            billing_key: billingKey,
            method: method || '카드',
            issuer_company: cardCompany || card?.issuerCode,
            acquirer_company: card?.acquirerCode,
            card_number: cardNumber || card?.number,
            card_type: card?.cardType,
            owner_type: card?.ownerType,
            authenticated_at: new Date().toISOString()
          }]);
        } catch (billingErr) {
          console.log("Could not save to separate billing table (may not exist yet).");
        }

        setStatus('success');
        
        // redirect after 3 seconds
        setTimeout(() => {
          navigate('/mypage/billing');
        }, 3000);

      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.message || '알 수 없는 오류가 발생했습니다.');
      }
    };

    processBillingAuth();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen pt-32 px-6 flex flex-col items-center">
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-4">
           <Loader2 className="w-12 h-12 animate-spin text-brand-primary" />
           <p className="text-xl font-bold">결제 수단을 등록하고 있습니다...</p>
        </div>
      )}
      
      {status === 'success' && (
        <div className="flex flex-col items-center gap-4">
           <CheckCircle2 className="w-16 h-16 text-green-500" />
           <p className="text-xl font-bold">카드 등록이 완료되었습니다!</p>
           <p className="text-gray-500">잠시 후 결제 관리 페이지로 이동합니다.</p>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-4">
           <XCircle className="w-16 h-16 text-red-500" />
           <p className="text-xl font-bold text-red-500">카드 등록에 실패했습니다.</p>
           <p className="text-gray-500">{errorMessage}</p>
           <button 
             onClick={() => navigate('/mypage/billing')}
             className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg font-bold"
           >
             돌아가기
           </button>
        </div>
      )}
    </div>
  );
};

export default BillingSuccessPage;
