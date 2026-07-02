import React, { useState, useEffect } from 'react';
import { accountClient, apiClient } from '../lib/ncpClient';
import { Heart, MessageCircle, Send, Bookmark, ChevronLeft, Instagram, MoreHorizontal, Copy, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toStorageUrl, getNcpImageUrl } from '../services/apiService';
import { supabase } from '../supabase';
import { AvatarImage } from './AvatarImage';

export default function AiPortfolioGrid({ user, avatarUrl, userName, onBack, onShare }: { user: any, avatarUrl?: string | null, userName?: string | null, onBack: () => void, onShare: (imageUrl: string, caption: string, tags: string[]) => void }) {
    const [portfolios, setPortfolios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [localAvatar, setLocalAvatar] = useState<string | null>(null);
    const [localUserName, setLocalUserName] = useState<string | null>(null);

    const [igAccount, setIgAccount] = useState<any>(null);
    useEffect(() => {
        const acc = localStorage.getItem('ig_account');
        if (acc) setIgAccount(JSON.parse(acc));
    }, []);

    const getProfileCandidatesFromData = (data: any) => {
        const list: string[] = [];
        if (!data) return list;
        
        const possibleNames = new Set<string>();
        const pf = data.profile;
        if (pf) {
            if (pf.details && Array.isArray(pf.details) && typeof pf.details[0] === 'string') {
                possibleNames.add(pf.details[0]);
            }
            if (pf.thumbNailPath) possibleNames.add(pf.thumbNailPath);
            if (pf.fileName) possibleNames.add(pf.fileName);
            if (pf.savedFileName) possibleNames.add(pf.savedFileName);
            if (pf.savedPath) possibleNames.add(pf.savedPath);
            if (pf.path) possibleNames.add(pf.path);
            if (pf.id) possibleNames.add(pf.id);
            if (pf.fileId) possibleNames.add(pf.fileId);
            if (pf.file_id) possibleNames.add(pf.file_id);
        }
        if (data.file_id) possibleNames.add(data.file_id);
        if (data.fileId) possibleNames.add(data.fileId);
        
        possibleNames.forEach(name => {
            if (!name) return;
            list.push(`https://api.cubric.io/api/storage?fileName=${name}`);
            list.push(`https://api.cubric.io/storage/${name}`);
            list.push(`/api/core/storage?fileName=${name}`);
            list.push(`/api/core/storage/${name}`);
            list.push(`/storage/${name}`);
        });
        
        const directOpts = [data.profileImageUrl, data.profileImage, data.imageUrl, data.image, data.avatarUrl, data.avatar_url];
        directOpts.forEach(u => { if (u) list.push(u); });
        
        const tempBlob = localStorage.getItem('temp_profile_blob');
        if (tempBlob) {
            list.unshift(tempBlob);
        }
        return Array.from(new Set(list));
    };

    const syncUserInfo = async () => {
        const token = localStorage.getItem('ncp_access_token');
        if (token) {
            try {
                const detailRes = await accountClient.get(`/designer/detail?_t=${Date.now()}`);
                if (detailRes && detailRes.data) {
                    const parsedCands = getProfileCandidatesFromData(detailRes.data);
                    if (parsedCands.length > 0) {
                        setLocalAvatar(parsedCands.join(','));
                    }
                    if (detailRes.data.name) {
                        setLocalUserName(detailRes.data.name);
                    }
                }
            } catch (err) {
                console.warn('Failed to sync user info in AiPortfolioGrid:', err);
            }
        } else if (user) {
            setLocalUserName(user.user_metadata?.full_name || user.user_metadata?.name || '원장님');
            const metaAvatar = user.user_metadata?.avatar_url;
            if (metaAvatar) {
                setLocalAvatar(metaAvatar);
            }
        }
        
        const tempBlob = localStorage.getItem('temp_profile_blob');
        if (tempBlob) {
            setLocalAvatar(prev => {
                if (!prev) return tempBlob;
                const items = prev.split(',');
                if (!items.includes(tempBlob)) {
                    items.unshift(tempBlob);
                }
                return items.join(',');
            });
        }
    };

    useEffect(() => {
        syncUserInfo();
        
        window.addEventListener('profile_updated', syncUserInfo);
        return () => {
            window.removeEventListener('profile_updated', syncUserInfo);
        };
    }, [user]);

    const fetchPortfolios = async () => {
        try {
            const res = await apiClient.get('/faceswap/album', { params: { size: 100 } });
            const items = res.data?.data?.content || res.data?.content || res.data?.data?.items || res.data?.items || res.data?.data || [];
            if (Array.isArray(items)) {
                const mappedItems = items.map((item: any) => {
                    const finalUrl = getNcpImageUrl(item);
                    return {
                        id: item.uid || item.id || item.imageId || Math.random().toString(),
                        image_url: finalUrl,
                        caption: '오직 나를 위한 AI 헤어 컨설팅 결과입니다.\n내게 딱 맞는 새로운 스타일을 발견했어요! 💇‍♀️✨',
                        tags: ['헤어딜', 'AI헤어', '헤어컨설팅', '뷰티스타그램', '헤어스타일', '퍼스널컨설팅', '헤어모델', '가상헤어'],
                        created_at: item.createdAt || new Date().toISOString()
                    };
                }).filter((item: any) => !!item.image_url);
                setPortfolios(mappedItems);
            }
        } catch (err: any) {
            if (err?.response?.status !== 500 && err?.response?.status !== 401 && err?.response?.status !== 403) {
                console.error("포트폴리오 조회 오류:", err);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPortfolios();
    }, [user]);

    if (loading) {
        return <div className="flex-1 flex items-center justify-center min-h-[400px]">Loading portfolios...</div>;
    }

    if (portfolios.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center px-6 min-h-[400px]">
                <Instagram className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">저장된 포트폴리오가 없습니다.</p>
                <p className="text-gray-400 text-sm mt-2">새로운 AI 시술 이미지를 생성해보세요.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white">
            <div className="flex-1 overflow-y-auto pb-20">
                <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
                    {portfolios.map((item, index) => (
                        <div 
                            key={item.id} 
                            className="aspect-square bg-gray-100 cursor-pointer overflow-hidden relative group"
                            onClick={() => setSelectedItem(item)}
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

            <AnimatePresence>
                {selectedItem && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
                        onClick={() => setSelectedItem(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl overflow-hidden w-full max-w-md shadow-2xl relative flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center p-4 border-b border-gray-100">
                                <h3 className="font-bold text-gray-900">상세보기</h3>
                                <button onClick={() => setSelectedItem(null)} className="text-gray-500 hover:text-gray-900 transition-colors bg-gray-100 p-1 rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="w-full aspect-square bg-gray-100 shrink-0">
                                <img 
                                    src={selectedItem.image_url || undefined} 
                                    className="w-full h-full object-cover" 
                                    alt="Selected Post" 
                                    referrerPolicy="no-referrer" 
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=800&q=80';
                                        (e.target as HTMLImageElement).classList.add('grayscale', 'opacity-50');
                                    }}
                                />
                            </div>

                            <div className="p-5 flex flex-col gap-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-8 h-8 rounded-full bg-brand-primary/10 overflow-hidden border border-gray-100 flex-shrink-0 flex items-center justify-center">
                                        <AvatarImage url={avatarUrl || localAvatar || user?.user_metadata?.avatar_url} className="w-full h-full object-cover" />
                                    </div>
                                    <span className="font-bold text-gray-900">{igAccount ? igAccount.username : (userName || localUserName || user?.user_metadata?.full_name || '원장님')}</span>
                                </div>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                    {selectedItem.caption}
                                </p>
                                <div className="text-blue-600 text-sm flex flex-wrap gap-1.5">
                                    {selectedItem.tags?.map((tag: string, idx: number) => (
                                        <span key={idx}>#{tag}</span>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => onShare(selectedItem.image_url, selectedItem.caption, selectedItem.tags)} 
                                    className="w-full bg-brand-primary text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 hover:bg-brand-primary/90 transition-colors mt-2 shadow-sm"
                                >
                                    <Instagram className="w-5 h-5" />
                                    인스타그램으로 공유하기
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
