import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Image, Share } from 'lucide-react';
import { supabase } from '../../supabase';
import { useNavigate } from 'react-router-dom';
import AiPortfolioGrid from '../../components/AiPortfolioGrid';

export default function PortfolioPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/');
        return;
      }
      setUser(session.user);
    };
    fetchUser();
  }, [navigate]);

  const handleShare = async (imageUrl: string, caption?: string, tags?: string[]) => {
      try {
          if (!navigator.share) {
               // Fallback: Copy URL
               await navigator.clipboard.writeText(imageUrl);
               alert("이미지 링크가 클립보드에 복사되었습니다.");
               return;
          }

          const shareTagString = tags ? tags.map((t: string) => `#${t}`).join(' ') : '';
          const shareText = caption ? `${caption}\n\n${shareTagString}` : 'AI 헤어모델 생성 결과입니다.';

          let shareData: any = {
             title: 'AI 헤어모델 포트폴리오',
             text: shareText,
             url: imageUrl
          };

          try {
              // For cross-platform support with files
              const fetchRes = await fetch(imageUrl);
              const blob = await fetchRes.blob();
              const file = new File([blob], 'ai_hair_model.jpg', { type: blob.type || 'image/jpeg' });
              
              if (navigator.canShare && navigator.canShare({ files: [file] })) {
                  shareData.files = [file];
                  delete shareData.url;
              }
          } catch (fetchErr) {
              console.warn("이미지 다운로드 실패 (CORS 등), 링크로만 공유합니다:", fetchErr);
          }
          
          await navigator.share(shareData);
      } catch (err: any) {
          if (err.name !== 'AbortError') {
              console.error(err);
              alert(`공유 실패: ${err.message}`);
          }
      }
  };

  if (!user) return <div className="min-h-screen bg-bg-base/50 flex justify-center pt-32">Loading...</div>;

  return (
    <div className="min-h-screen bg-bg-base pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl shadow-brand-primary/5 border border-indigo-50/50 overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 border-b border-gray-100 bg-gradient-to-br from-indigo-50/50 to-white flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-brand-primary shadow-inner">
              <Image className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">마이 포트폴리오</h1>
              <p className="text-gray-500 font-medium mt-1">내가 생성한 AI 헤어모델을 확인하고 외부로 공유할 수 있습니다.</p>
            </div>
          </div>

          <div className="p-8 pb-32">
             <div className="max-w-md mx-auto border border-gray-200 rounded-[2rem] overflow-hidden shadow-lg h-[800px] flex flex-col bg-white">
                <AiPortfolioGrid user={user} onBack={() => {}} onShare={handleShare} />
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
