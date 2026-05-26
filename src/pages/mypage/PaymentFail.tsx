import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

const PaymentFailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code');
  const message = searchParams.get('message');

  return (
    <div className="min-h-screen pt-32 px-6 flex flex-col items-center text-center">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-white rounded-[32px] p-10 border border-gray-100 shadow-xl"
      >
        <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
        <h1 className="text-3xl font-black text-gray-900 mb-2">결제에 실패하였습니다</h1>
        <p className="text-gray-500 font-medium mb-8">오류가 발생하여 결제를 완료하지 못했습니다.</p>
        
        <div className="bg-red-50 rounded-2xl p-6 mb-8 text-left border border-red-100">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-xs font-black text-red-500 uppercase tracking-widest">Error Details</span>
          </div>
          <p className="text-sm font-bold text-red-700 mb-1">Code: {code}</p>
          <p className="text-sm text-red-600 font-medium">{message}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/mypage/credits')}
            className="py-4 bg-gray-50 text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transition-colors"
          >
            충전 페이지로
          </button>
          <button 
            onClick={() => navigate('/')}
            className="py-4 bg-gray-900 text-white rounded-2xl font-bold hover:shadow-xl transition-all active:scale-95"
          >
            홈으로 이동
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentFailPage;
