import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Image, Share, Wifi, Battery, ArrowLeft, Home, Camera, Instagram } from 'lucide-react';
import { supabase } from '../../supabase';
import { useNavigate } from 'react-router-dom';
import AiPortfolioGrid from '../../components/AiPortfolioGrid';
import { safeJwtDecode } from '../../lib/supabase-utils';

export default function PortfolioPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const ncpToken = localStorage.getItem('ncp_access_token');
        if (ncpToken) {
          try {
            const decoded = safeJwtDecode(ncpToken);
            if (decoded && isMounted.current) {
              const rawId = decoded.id || '';
              const fullUuid = rawId.includes('-')
                ? rawId
                : `${rawId.substring(0, 8)}-${rawId.substring(8, 12)}-${rawId.substring(12, 16)}-${rawId.substring(16, 20)}-${rawId.substring(20)}`;
              setUser({
                id: fullUuid,
                email: decoded.email || `${decoded.id}@ncp.local`,
                user_metadata: {
                  full_name: decoded.name || '디자이너',
                  avatar_url: decoded.profileImageUrl || ''
                }
              });
              setLoading(false);
              return;
            }
          } catch (jwtErr) {
            console.warn("Failed decoding NCP token on portfolio page:", jwtErr);
          }
        }

        // Supabase login fallback
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          if (isMounted.current) {
            setUser(session.user);
          }
        } else {
          if (isMounted.current) {
            navigate('/');
          }
        }
      } catch (err) {
        console.error("Auth check failed in PortfolioPage:", err);
        if (isMounted.current) navigate('/');
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base/50 flex flex-col items-center justify-center pt-32">
        <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-bold text-sm">포트폴리오 스튜디오 동기화 중...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-bg-base/50 flex flex-col items-center justify-center pt-32">
        <p className="text-gray-500 font-bold text-sm mb-4">로그인이 필요합니다.</p>
        <button onClick={() => navigate('/')} className="bg-brand-primary text-white font-bold px-6 py-2.5 rounded-xl">
          홈으로 이동
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base pt-24 pb-20 px-4 flex flex-col items-center">
      <div className="max-w-3xl w-full mx-auto flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <button 
            onClick={() => navigate('/')} 
            className="text-gray-500 hover:text-gray-900 transition-colors flex items-center justify-center p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">시술 포트폴리오</h1>
        </div>

        {/* Interactive Grid Area */}
        <div className="w-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
          <AiPortfolioGrid user={user} onBack={() => navigate('/')} onShare={handleShare} />
        </div>
      </div>
    </div>
  );
}
