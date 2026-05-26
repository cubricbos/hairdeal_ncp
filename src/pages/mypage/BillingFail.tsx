import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const BillingFailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const message = searchParams.get('message') || '결제 수단 등록이 취소되었거나 실패했습니다.';

  return (
    <div className="min-h-screen pt-32 px-6 flex flex-col items-center">
      <XCircle className="w-16 h-16 text-red-500 mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">카드 등록 실패</h1>
      <p className="text-gray-500 mb-8">{message}</p>
      <button 
        onClick={() => navigate('/mypage/billing')}
        className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold transition-all active:scale-95"
      >
        결제 관리로 돌아가기
      </button>
    </div>
  );
};

export default BillingFailPage;
