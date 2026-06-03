import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Heart, MessageCircle, Send, Bookmark, ChevronLeft, Instagram, MoreHorizontal, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AiPortfolioGrid({ user, onBack, onShare }: { user: any, onBack: () => void, onShare: (imageUrl: string, caption: string, tags: string[]) => void }) {
    const [portfolios, setPortfolios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'feed'>('grid');
    const [selectedFeedIndex, setSelectedFeedIndex] = useState(0);

    const [igAccount, setIgAccount] = useState<any>(null);
    useEffect(() => {
        const acc = localStorage.getItem('ig_account');
        if (acc) setIgAccount(JSON.parse(acc));
    }, []);

    useEffect(() => {
        const fetchPortfolios = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('ai_portfolios')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });
                
                if (data) {
                    setPortfolios(data);
                }
            } catch (err) {
                console.error("포트폴리오 조회 오류:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPortfolios();
    }, [user]);

    if (loading) {
        return <div className="flex-1 flex items-center justify-center">Loading portfolios...</div>;
    }

    if (portfolios.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center px-6">
                <Instagram className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">저장된 포트폴리오가 없습니다.</p>
                <p className="text-gray-400 text-sm mt-2">새로운 AI 시술 이미지를 생성해보세요.</p>
            </div>
        );
    }

    if (viewMode === 'feed') {
        return (
            <div className="flex-1 bg-white overflow-y-auto w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="sticky top-0 z-10 bg-white border-b border-gray-100 flex items-center px-4 py-3">
                    <button onClick={() => setViewMode('grid')} className="mr-3 text-gray-900">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <span className="font-bold text-gray-900">포트폴리오</span>
                </div>
                
                <div className="flex flex-col">
                    {portfolios.map((item, index) => (
                        <div key={item.id} className="border-b border-gray-100 pb-4 mb-4" id={`post-${index}`}>
                             <div className="flex items-center justify-between px-3 py-3 bg-white">
                                 <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-full border border-gray-200 overflow-hidden bg-gray-100">
                                        <img src={(igAccount?.profileUrl) || (user.user_metadata?.avatar_url) || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80"} className="w-full h-full object-cover" alt="Profile avatar" referrerPolicy="no-referrer" />
                                    </div>
                                    <div className="flex flex-col">
                                       <span className="text-xs font-[800] text-gray-900 leading-tight">{igAccount ? igAccount.username : (user.user_metadata?.full_name || 'HAIR_DEAL')}</span>
                                       <span className="text-[10px] text-gray-400 font-medium">Seoul, Korea</span>
                                    </div>
                                 </div>
                                 <MoreHorizontal className="w-5 h-5 text-gray-500" />
                             </div>

                             <div className="w-full aspect-square bg-gray-50 relative">
                                <img 
                                  src={item.image_url || undefined} 
                                  className="w-full h-full object-cover" 
                                  alt="Post" 
                                  referrerPolicy="no-referrer" 
                                  onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=800&q=80';
                                      (e.target as HTMLImageElement).classList.add('grayscale', 'opacity-50');
                                  }}
                                />
                             </div>

                             <div className="px-3 py-3 flex justify-between items-center">
                                 <div className="flex gap-4">
                                     <Heart className={`w-6 h-6 text-red-500 fill-red-500`} />
                                     <MessageCircle className="w-6 h-6 text-gray-900" />
                                      <button onClick={() => onShare(item.image_url, "", [])}>
                                         <Send className="w-6 h-6 text-gray-900" />
                                      </button>
                                 </div>
                                 <Bookmark className="w-6 h-6 text-gray-900" />
                             </div>

                             <div className="px-4 text-[13px] leading-[1.5] text-gray-900">
                                 <div className="mb-2"><span className="font-bold">Liked by jimin_99</span> and <span className="font-bold">1,248 others</span></div>
                                 
                                  <p className="whitespace-pre-wrap flex flex-col">
                                     <span><span className="font-[800] mr-1.5">{igAccount ? igAccount.username : (user.user_metadata?.full_name || 'HAIR_DEAL')}</span>{item.caption?.split('\n')[0]}</span>
                                     <span className="mt-1">{item.caption?.split('\n').slice(1).join('\n')}</span>
                                  </p>
                                  <div className="text-blue-900 mt-1.5 font-medium flex flex-wrap gap-1">
                                     {(item.tags || []).map((tag: string, tagIdx: number) => (
                                        <span key={`${tag}-${tagIdx}`}>#{tag}</span>
                                     ))}
                                  </div>
                                 <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mt-4">
                                     {new Date(item.created_at).toLocaleDateString()}
                                 </div>
                             </div>
                             
                             <div className="px-4 mt-4">
                               <button onClick={() => onShare(item.image_url, "", [])} className="w-full bg-brand-primary text-white font-bold text-[14px] py-3 rounded-2xl flex justify-center items-center gap-2 hover:bg-indigo-600 transition-colors">
                                   <Send className="w-4 h-4" />
                                   외부로 이미지 전송하기
                               </button>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white">
            <div className="flex-1 overflow-y-auto pb-20">
                <div className="grid grid-cols-3 gap-0.5">
                    {portfolios.map((item, index) => (
                        <div 
                            key={item.id} 
                            className="aspect-square bg-gray-100 cursor-pointer overflow-hidden relative group"
                            onClick={() => {
                                setSelectedFeedIndex(index);
                                setViewMode('feed');
                                // Wait for render then scroll
                                setTimeout(() => {
                                    document.getElementById(`post-${index}`)?.scrollIntoView({ behavior: 'auto' });
                                }, 50);
                            }}
                        >
                            <img 
                                src={item.image_url || undefined} 
                                alt="" 
                                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" 
                                referrerPolicy="no-referrer" 
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=400&q=80';
                                    (e.target as HTMLImageElement).classList.add('grayscale', 'opacity-50');
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
