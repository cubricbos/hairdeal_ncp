import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Camera, Instagram, RefreshCw, CheckCircle2, Wand2, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, PlusSquare, Home, Search, Loader2, ChevronLeft, Plus } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const DEFAULT_MODEL_PRESETS = {
  female: [
    { id: 'f1', desc: '청순한 분위기의 20대 한국 여성', image: 'https://images.unsplash.com/photo-1618886487325-f837626bd2a4?auto=format&fit=crop&w=300&q=80' },
    { id: 'f2', desc: '세련된 무드의 30대 여성', image: 'https://images.unsplash.com/photo-1579038773867-0402b8d5e8ab?auto=format&fit=crop&w=300&q=80' },
  ],
  male: [
    { id: 'm1', desc: '자연스러운 댄디 스타일의 20대 남성', image: 'https://images.unsplash.com/photo-1623862274431-1e9bf4d2847d?auto=format&fit=crop&w=300&q=80' },
    { id: 'm2', desc: '트렌디한 아이돌 무드의 남성', image: 'https://images.unsplash.com/photo-1583096114844-06ce12338bd4?auto=format&fit=crop&w=300&q=80' },
  ]
};

import { uploadToStorage, waitForNcpAlbumResult } from '../services/apiService';
import { useSiteContext } from '../context/SiteContext';
import { checkAndRewardReferralActivity } from '../lib/referral';
import { accountClient, apiClient } from '../lib/ncpClient';
import axios from 'axios';
import { AvatarImage } from '../components/AvatarImage';

export default function AiHairModelPage({ user }: { user: User | null }) {
  const { settings } = useSiteContext();
  const faceFusionUrlParam = settings?.integrations?.facefusionUrl;

  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [showDeviceWarning, setShowDeviceWarning] = useState(false);
  const [activeTab, setActiveTab] = useState<'creation' | 'preview'>('creation');

  const [igAccount, setIgAccount] = useState<any>(null);

  useEffect(() => {
    const acc = localStorage.getItem('ig_account');
    if (acc) setIgAccount(JSON.parse(acc));
  }, []);

  useEffect(() => {
    const checkDevice = () => {
      // Allow Supabase OAuth to parse tokens before redirecting
      if (window.location.hash.includes('access_token') || window.location.hash.includes('error_description')) {
        return;
      }

      const ua = navigator.userAgent;
      const mobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      if (mobile) {
        navigate('/ai-hair-model_app', { replace: true });
        return;
      }
      setIsMobile(false);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, [navigate]);

  // Dynamic Models State
  const [modelPresets, setModelPresets] = useState<{ female: any[], male: any[] }>({ female: [], male: [] });
  const [isLoadingModels, setIsLoadingModels] = useState(true);

  // Fetch models from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    const fetchModels = async () => {
      try {
        let modelsData: any[] = null;
        let lastError = null;
        
        // Retry logic to prevent transient network drops
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const { data: sortedData, error: sortedError } = await supabase
              .from('ai_models')
              .select('*')
              .eq('is_active', true)
              .order('sort_order', { ascending: true })
              .order('created_at', { ascending: false });

            if (!sortedError && sortedData) {
              modelsData = sortedData;
              break; // Success
            } else {
              lastError = sortedError;
              console.warn(`[AiModels] Fetch attempt ${attempt} failed:`, sortedError);
              
              // If it's a column missing error, try without sort_order
              if (sortedError?.message?.includes('sort_order') || sortedError?.code === '42703') {
                const { data: fallbackData, error: fbError } = await supabase
                  .from('ai_models')
                  .select('*');
                if (!fbError && fallbackData) {
                  modelsData = fallbackData;
                  break;
                }
              }
            }
          } catch (err) {
            console.error(`[AiModels] Exception on attempt ${attempt}:`, err);
          }
          if (attempt < 3) await new Promise(r => setTimeout(r, 1000 * attempt));
        }

        if (!isMounted) return;

        if (modelsData && modelsData.length > 0) {
           const activeModels = modelsData.filter(m => m.is_active !== false);
           const female = activeModels.filter(m => m.gender === 'female').map(m => ({ id: m.id, desc: m.description, image: m.image_url }));
           const male = activeModels.filter(m => m.gender === 'male').map(m => ({ id: m.id, desc: m.description, image: m.image_url }));
           
           if (female.length > 0 || male.length > 0) {
              setModelPresets({ female, male });
           } else {
              // Only fallback if DB explicitly has 0 active models
              setModelPresets(DEFAULT_MODEL_PRESETS);
           }
        } else if (modelsData?.length === 0) {
           // DB is explicitly empty
           setModelPresets(DEFAULT_MODEL_PRESETS);
        } else {
           // DB fetch completely failed after retries.
           // You may choose to show an error or fallback. For now fallback.
           console.error("DB connection persists to drop, using fallback models", lastError);
           setModelPresets(DEFAULT_MODEL_PRESETS);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to load models fallback to default", err);
        setModelPresets(DEFAULT_MODEL_PRESETS);
      } finally {
        if (isMounted) setIsLoadingModels(false);
      }
    };
    fetchModels();
    
    return () => { isMounted = false; };
  }, []);

  // Step 1: Hair Image & Style Name
  const [hairImage, setHairImage] = useState<{ url: string, base64: string, mimeType: string } | null>(null);
  const [styleGender, setStyleGender] = useState<'female' | 'male'>('female');
  const [selectedHairStyles, setSelectedHairStyles] = useState<string[]>([]);
  const [showCustomStyleModal, setShowCustomStyleModal] = useState(false);
  const [customStyleInput, setCustomStyleInput] = useState("");
  const [hairStyles, setHairStyles] = useState<{ female: string[], male: string[] }>({
    female: ['허쉬컷', '태슬컷', '레이어드컷', '슬릭펌', '빌드펌', '히피펌', '단발펌', '그레이스펌'],
    male: ['댄디컷', '리프컷', '가일컷', '애즈펌', '시스루펌', '투블럭', '가르마펌', '쉐도우펌']
  });
  
  useEffect(() => {
    let isMounted = true;
    const fetchStyles = async () => {
      try {
        let finalData: any[] = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const { data, error } = await supabase
              .from('hair_styles')
              .select('*')
              .order('sort_order', { ascending: true });
            
            if (!error && data) {
              finalData = data;
              break;
            } else {
              console.warn(`[HairStyles] Fetch attempt ${attempt} failed:`, error);
              if (error?.message?.includes('sort_order') || error?.code === '42703') {
                const { data: fallbackData, error: fbError } = await supabase.from('hair_styles').select('*');
                if (!fbError && fallbackData) {
                  finalData = fallbackData;
                  break;
                }
              }
            }
          } catch (err) {
            console.error(`[HairStyles] Exception on attempt ${attempt}:`, err);
          }
          if (attempt < 3) await new Promise(r => setTimeout(r, 1000 * attempt));
        }

        if (!isMounted) return;

        if (finalData && finalData.length > 0) {
          const fetchedStyles = { female: [] as string[], male: [] as string[] };
          finalData.forEach(s => {
            if (s.gender === 'female' && !fetchedStyles.female.includes(s.name)) fetchedStyles.female.push(s.name);
            if (s.gender === 'male' && !fetchedStyles.male.includes(s.name)) fetchedStyles.male.push(s.name);
          });
          
          setHairStyles(prev => ({
            female: fetchedStyles.female.length > 0 ? fetchedStyles.female : prev.female,
            male: fetchedStyles.male.length > 0 ? fetchedStyles.male : prev.male
          }));
        }
      } catch (err: any) {
         if (!isMounted) return;
         if (err?.message !== 'Failed to fetch' && err?.message !== 'FetchError') {
           console.warn("Failed to fetch hair_styles, using defaults");
         }
      }
    };
    fetchStyles();
    return () => { isMounted = false; };
  }, []);

  const toggleHairStyle = (style: string) => {
    setSelectedHairStyles(prev => {
      if (prev.includes(style)) return prev.filter(s => s !== style);
      if (prev.length >= 3) {
          alert("시술명은 최대 3개까지 선택 가능합니다.");
          return prev;
      }
      return [...prev, style];
    });
  };

  const handleAddCustomStyle = () => {
    if (!customStyleInput.trim()) return;
    setHairStyles(prev => ({
      ...prev,
      [styleGender]: [customStyleInput.trim(), ...prev[styleGender].filter(s => s !== customStyleInput.trim())]
    }));
    toggleHairStyle(customStyleInput.trim());
    setCustomStyleInput("");
    setShowCustomStyleModal(false);
  };

  // Step 2: Model Face Selection
  const [modelGender, setModelGender] = useState<'female' | 'male'>('female');
  const [modelFace, setModelFace] = useState<{ isPreset: boolean, url?: string, desc?: string, base64?: string, mimeType?: string } | null>(null);
  
  // App State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState<number>(0);
  const [generatingStatus, setGeneratingStatus] = useState<string>("이미지 랜드마크를 추출하여\n포트폴리오를 생성 중입니다.");
  const [isUploading, setIsUploading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultCaption, setResultCaption] = useState<{ caption: string, tags: string[] } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 4000);
  };

  const hairInputRef = useRef<HTMLInputElement>(null);
  const faceInputRef = useRef<HTMLInputElement>(null);
  const stylesContainerRef = useRef<HTMLDivElement>(null);
  const facesContainerRef = useRef<HTMLDivElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    // Basic protection: if we know there's no session initializing, redirect. 
    // In a real app we'd wait for auth state to finish loading.
    const checkAuth = setTimeout(() => {
      if (!window.location.hash.includes('access_token') && !user) {
        navigate('/');
        window.dispatchEvent(new CustomEvent('open-auth'));
      }
    }, 1000);
    return () => clearTimeout(checkAuth);
  }, [user, navigate]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'hair' | 'face') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      const base64Content = base64Data.split(',')[1];
      
      if (type === 'hair') {
        setHairImage({ url: URL.createObjectURL(file), base64: base64Content, mimeType: file.type });
      } else {
        setModelFace({ isPreset: false, url: URL.createObjectURL(file), base64: base64Content, mimeType: file.type });
      }
    };
    reader.readAsDataURL(file);
  };

  // Credit System State
  const [userCredits, setUserCredits] = useState<number>(0);
  const [userName, setUserName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [generationCost, setGenerationCost] = useState<number>(10);
  const [showCreditModal, setShowCreditModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('ncp_access_token');
      if (!token) {
        if (user) {
          setUserName(user.user_metadata?.full_name || user.user_metadata?.name || '원장님');
        }
        return;
      }
      try {
        const { data } = await accountClient.get('/designer/find/profile');
        if (data && data.name) {
          setUserName(data.name);
        } else if (user) {
          setUserName(user.user_metadata?.full_name || user.user_metadata?.name || '원장님');
        }
      } catch (err) {
        console.warn('NCP 프로필 조회 실패 (비활성화 상태이거나 토큰 무효):', err);
        if (user) {
          setUserName(user.user_metadata?.full_name || user.user_metadata?.name || '원장님');
        }
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
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
              setAvatarUrl(parsedCands.join(','));
            }
            if (detailRes.data.name) {
              setUserName(detailRes.data.name);
            }
          }
        } catch (err) {
          console.warn('Failed to sync user info in syncUserInfo:', err);
        }
      } else if (user) {
        setUserName(user.user_metadata?.full_name || user.user_metadata?.name || '원장님');
        const metaAvatar = user.user_metadata?.avatar_url;
        if (metaAvatar) {
          setAvatarUrl(metaAvatar);
        }
      }
      
      const tempBlob = localStorage.getItem('temp_profile_blob');
      if (tempBlob) {
        setAvatarUrl(prev => {
          if (!prev) return tempBlob;
          const items = prev.split(',');
          if (!items.includes(tempBlob)) {
            items.unshift(tempBlob);
          }
          return items.join(',');
        });
      }
    };

    const fetchCreditsInfo = async () => {
      if (user) {
        // Sync userName and avatar Url unconditionally!
        await syncUserInfo();

        const token = localStorage.getItem('ncp_access_token');
        if (token) {
          try {
            let currentNcpCredits: number | null = null;
            try {
              const res = await apiClient.get('/faceswap/credit');
              if (res.data && res.data.credit !== undefined) {
                currentNcpCredits = res.data.credit;
              } else if (res.data && res.data.credits !== undefined) {
                currentNcpCredits = res.data.credits;
              }
            } catch (e) {
              try {
                const res = await apiClient.get('/faceswap/credit/summary');
                if (res.data && res.data.credit !== undefined) {
                  currentNcpCredits = res.data.credit;
                } else if (res.data && res.data.credits !== undefined) {
                  currentNcpCredits = res.data.credits;
                }
              } catch (e2) {
                try {
                  const ncpRes = await accountClient.get('/designer/detail');
                  if (ncpRes.data && ncpRes.data.credit !== undefined) {
                    currentNcpCredits = ncpRes.data.credit;
                  }
                } catch (e3) {
                  console.warn('Failed to retrieve NCP credits in AI Hair Model Page from all paths', e3);
                }
              }
            }

            if (currentNcpCredits !== null) {
              setUserCredits(currentNcpCredits);
              // Keeps profiles.credits table in sync in background
              supabase.from('profiles').update({ credits: currentNcpCredits }).eq('id', user.id).then();
              
              const { data: metrics } = await supabase.from('app_metrics').select('generation_credit_cost').eq('id', 1).single();
              if (metrics && metrics.generation_credit_cost !== undefined) setGenerationCost(metrics.generation_credit_cost);
              return; // Succeeded!
            }
          } catch (ncpErr) {
            console.warn('Failed to fetch credits from NCP, falling back to Supabase', ncpErr);
          }
        }

        try {
           const { data: profile, error } = await supabase.from('profiles').select('credits, full_name').eq('id', user.id).single();
           let currentCredits = 0;
           if (!error && profile) {
             if (profile.credits !== undefined) currentCredits = profile.credits;
             if (profile.full_name && !userName) setUserName(profile.full_name);
           }

           const { data: txs } = await supabase.from('credit_transactions').select('*').eq('user_id', user.id);
           if (txs) {
              const calculated = txs.reduce((acc, tx) => tx.type === 'earned' ? acc + tx.amount : acc - tx.amount, 0);
              if (calculated !== currentCredits) {
                 currentCredits = calculated;
                 await supabase.from('profiles').update({ credits: currentCredits }).eq('id', user.id);
              }
           }
           setUserCredits(currentCredits);

           const { data: metrics } = await supabase.from('app_metrics').select('generation_credit_cost').eq('id', 1).single();
           if (metrics && metrics.generation_credit_cost !== undefined) setGenerationCost(metrics.generation_credit_cost);
        } catch(e) {}
      }
    };
    fetchCreditsInfo();

    // Set up Realtime subscription
    let subscription: any = null;
    if (user) {
      const channel = supabase
        .channel(`profiles_${user.id}_desktop_${Math.random().toString(36).substring(7)}`)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles',
          filter: `id=eq.${user.id}`
        }, (payload) => {
          if (payload.new) {
            if (payload.new.credits !== undefined) {
              setUserCredits(payload.new.credits);
            }
            if (payload.new.full_name) {
              setUserName(payload.new.full_name);
            }
            if (payload.new.avatar_url !== undefined) {
              setAvatarUrl(payload.new.avatar_url);
            }
          }
        });
      
      subscription = channel.subscribe();
    }

    const handleUpdated = () => fetchCreditsInfo();
    window.addEventListener('credits_updated', handleUpdated);
    window.addEventListener('profile_updated', handleUpdated);
    return () => {
      window.removeEventListener('credits_updated', handleUpdated);
      window.removeEventListener('profile_updated', handleUpdated);
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [user]);

  const handleGenerateClick = () => {
    if (!hairImage) {
      alert("뷰티 시술 이미지를 업로드해주세요.");
      return;
    }
    if (selectedHairStyles.length === 0) {
      alert("시술명을 하나 이상 선택해주세요. (최대 3개)");
      return;
    }
    if (!modelFace) {
      alert("합성할 모델을 선택하거나 업로드해주세요.");
      return;
    }
    if (userCredits < generationCost) {
      alert(`크레딧이 부족합니다. (보유: ${userCredits}C / 필요: ${generationCost}C)\n크레딧 충전 페이지를 이용해주세요.`);
      return;
    }
    setShowCreditModal(true);
  };

  const confirmGenerate = async () => {
    setShowCreditModal(false);
    setResultImage(null);
    setResultCaption(null);
    setIsGenerating(true);
    
    try {
      if (user) {
         // Fetch LATEST balance from DB/NCP to prevent stale state issues
         let currentDBCredits = userCredits;
         const token = localStorage.getItem('ncp_access_token');
         if (token) {
           try {
             let currentNcpCredits: number | null = null;
             try {
               const res = await apiClient.get('/faceswap/credit');
               if (res.data && res.data.credit !== undefined) {
                 currentNcpCredits = res.data.credit;
               } else if (res.data && res.data.credits !== undefined) {
                 currentNcpCredits = res.data.credits;
               }
             } catch (e) {
               try {
                 const res = await apiClient.get('/faceswap/credit/summary');
                 if (res.data && res.data.credit !== undefined) {
                   currentNcpCredits = res.data.credit;
                 } else if (res.data && res.data.credits !== undefined) {
                   currentNcpCredits = res.data.credits;
                 }
               } catch (e2) {
                 try {
                   const ncpRes = await accountClient.get('/designer/detail');
                   if (ncpRes.data && ncpRes.data.credit !== undefined) {
                     currentNcpCredits = ncpRes.data.credit;
                   }
                 } catch (e3) {
                   console.warn('Failed to retrieve NCP credits in confirmGenerate', e3);
                 }
               }
             }
             if (currentNcpCredits !== null) {
               currentDBCredits = currentNcpCredits;
             }
           } catch (e) {
             console.warn('Failed to parse latest credit from NCP:', e);
           }
         } else {
           try {
             const { data: latestProfile } = await supabase.from('profiles').select('credits').eq('id', user.id).single();
             if (latestProfile) {
               currentDBCredits = latestProfile.credits ?? userCredits;
             }
           } catch (e) {
             console.warn('Failed to parse latest credit from Supabase:', e);
           }
         }

         if (currentDBCredits < generationCost) {
            alert(`크레딧이 부족합니다. (보유: ${currentDBCredits}C / 필요: ${generationCost}C)\n크레딧 충전 페이지를 이용해주세요.`);
            setIsGenerating(false);
            return;
         }

         const newCredits = currentDBCredits - generationCost;
         setUserCredits(newCredits);

         // Robust fallbacks: Update databases silently to avoid crash on RLS or network failures
         try {
           await supabase.from('profiles').update({ credits: newCredits }).eq('id', user.id);
           /* await supabase.from('credit_transactions').insert([{
              user_id: user.id,
              type: 'spent',
              amount: generationCost,
              description: 'AI 헤어모델 생성'
           }]); */
         } catch (silentErr) {
           console.warn("Silent profile and tx database update skipped/unsuccessful:", silentErr);
         }
         window.dispatchEvent(new Event('credits_updated'));
      }
      let finalImageUrl = hairImage?.url || '';
      let progressInterval: any = null;
      try {
        if (false) {
           throw new Error("API 통신을 위한 환경변수(.env)가 설정되지 않았습니다.");
        }

        setGeneratingProgress(5);
        setGeneratingStatus("디자이너 인증 및 크레딧 상태 확인 중... (5%)");

        // 1. 필요한 이미지를 Storage에 업로드 후 URL 획득
        let sourceUrl = modelFace?.url || '';
        if (modelFace?.base64 && !modelFace?.isPreset) {
           setGeneratingProgress(12);
           setGeneratingStatus("소스 성별 모델 이미지 경량 분석 중... (12%)");
           sourceUrl = await uploadToNcpServer(modelFace.base64);
        }

        let targetUrl = hairImage?.url || '';
        if (hairImage?.base64) {
           setGeneratingProgress(25);
           setGeneratingStatus("타겟 헤어 디자인 업로드 및 에지 검출 중... (25%)");
           targetUrl = await uploadToNcpServer(hairImage.base64);
        }

        if (sourceUrl && targetUrl) {
           setGeneratingProgress(40);
           setGeneratingStatus("NCP AI 로컬 대기열 연동 개시 중... (40%)");

           // 1.5 Get current initial album top image ID
            let initialTopImageId = null;
            try {
               const albumRes = await apiClient.get('/faceswap/album', { params: { page: 0, size: 1 } });
               const items = albumRes.data?.data?.content || albumRes.data?.content || albumRes.data?.data?.items || albumRes.data?.items || [];
               if (items && items.length > 0) {
                  initialTopImageId = items[0].uid || items[0].id;
               }
            } catch (e) {
               console.warn("Could not fetch initial album top image ID", e);
            }

           setGeneratingProgress(50);
           setGeneratingStatus("AI 큐 요청 접수 및 리소스 프로비저닝 중... (50%)");

           // 2. 백엔드 API 호출 (생성 요청 NCP API 사용)
           const response = await apiClient.post('/faceswap/start', {
              sourceUrl: sourceUrl,
              targetUrl: targetUrl
           });
           const taskId = response.data?.taskId || response.data?.data?.taskId || 'pseudo_taskId';

           // 3. Polling으로 결과 확인
           if (taskId) {
              setGeneratingProgress(58);
              setGeneratingStatus("대기열 예약 성공! 안면 좌표 추출 작업 개시... (58%)");

              // Start background incremental updates for percentage during polling
              progressInterval = setInterval(() => {
                setGeneratingProgress((prev) => {
                  if (prev >= 95) return 95;
                  const nextVal = prev + Math.floor(Math.random() * 2) + 1;
                  const finalVal = nextVal > 95 ? 95 : nextVal;

                  if (finalVal < 70) {
                    setGeneratingStatus(`AI 윤곽 모델 융합 정합도 분석 중... (${finalVal}%)`);
                  } else if (finalVal < 80) {
                    setGeneratingStatus(`주변 환경 조치 및 피부 톤 자연 대치 조정 중... (${finalVal}%)`);
                  } else if (finalVal < 90) {
                    setGeneratingStatus(`헤어 라인 가장자리 스무딩 및 음영 복원 데칼... (${finalVal}%)`);
                  } else {
                    setGeneratingStatus(`고해상도 업스케일러 분석 및 표정 복원 중... (${finalVal}%)`);
                  }
                  return finalVal;
                });
              }, 1000);

              finalImageUrl = await waitForNcpAlbumResult(
                initialTopImageId,
                apiClient,
                (status) => {
                  if (status === 'QUEUED') {
                    setGeneratingProgress(52);
                    setGeneratingStatus("대기 상태: 작업 예약 대기 중... (대기열 스마트 순번 분석 처리 중)");
                  }
                },
                taskId
              );

              const keywordsString = selectedHairStyles.join(', ');

              const captionTemplates = [
                `오늘 방문해주신 고객님의 맞춤 '${keywordsString}' 디자인 ✂️✨\n\n고객님의 두상과 모질, 평소 스타일링 습관까지 꼼꼼하게 고려해서 가장 예쁜 볼륨감과 텍스처를 살려 디자인해 드렸어요. 툭 털어서 말리기만 해도 금방 샵에 다녀온 것처럼 손질이 너무 편하실 거예요! 분위기 변신 대성공이네요 💖\n\n올 봄, 나만의 찰떡 인생머리를 찾고 싶으시다면 편하게 문의주세요!`,
                `요즘 가장 사랑받는 '${keywordsString}' 스타일링 🕊️\n\n특유의 부드럽고 세련된 무드를 극대화해 드렸습니다. 매일 아침 드라이할 시간 부족하신 분들께 강력 추천해 드려요! 가벼운 에센스 하나만 발라도 느낌 있게 완성됩니다.\n\n고객님의 니즈에 맞춰 1:1 맞춤 컨설팅 진행합니다. 예약 마감이 빠르니 서둘러 주세요! 🔥`,
                `단발/장발병 유발하는 완벽한 '${keywordsString}' 💇‍♀️💕\n\n얼굴형을 보완해주는 디테일한 커트 라인과 얼굴빛을 살려주는 컬러의 조합! 시술 후 거울 보시고 찐으로 행복해하시던 고객님 모습이 아직도 눈에 선하네요. 만족도 200% 보장하는 디자인입니다.\n\n나만의 퍼스널 헤어, 지금 바로 경험해보세요.`
              ];

              const selectedCaption = captionTemplates[Math.floor(Math.random() * captionTemplates.length)];

              const finalCaption = `${selectedCaption}\n\n💌 예약 및 상담은 프로필 상단 링크\n📩 디자인 문의: DM`;
              const finalTags = [
                  ...selectedHairStyles.map((s: string) => s.replace(/\s+/g, '')),
                  ...selectedHairStyles.map((s: string) => `${s.replace(/\s+/g, '')}추천`),
                  "헤어스타일", 
                  "머리잘하는곳", 
                  "인생머리", 
                  "미용실추천"
              ];

              try {
                  if (finalImageUrl && finalImageUrl.startsWith('data:')) {
                      finalImageUrl = await uploadToStorage(finalImageUrl, 'results');
                  }
              } catch (err: any) {
                  console.warn('업로드 및 포트폴리오 에러 (로컬 이미지를 유지합니다):', err.message);
              }

              if (!finalImageUrl) {
                   throw new Error("결과 이미지 URL 수신 실패");
               }

               // 3.5 이미지 완전 프리로드 (100% 로딩 완료 후 우측 표시 및 완료 처리)
               setGeneratingProgress(99);
               setGeneratingStatus("결과물 이미지 다운로드 및 가속 렌더링 준비 중... (99%)");
               await new Promise<void>((resolve) => {
                  const img = new Image();
                  img.src = finalImageUrl;
                  img.onload = () => {
                     console.log("[Preload] Web page image loaded successfully:", finalImageUrl);
                     resolve();
                  };
                  img.onerror = (e) => {
                     console.warn("[Preload] Web page image load failed, proceeding fallback:", e);
                     resolve();
                  };
               });

               setResultImage(finalImageUrl);
               setResultCaption({
                 caption: finalCaption,
                 tags: finalTags
               });

               if (progressInterval) clearInterval(progressInterval);
               setGeneratingProgress(100);
               setGeneratingStatus("합성 완료! 눈부신 이미지 변신 결과를 확인하세요!");
               await new Promise(r => setTimeout(r, 1200));

           } else {
              throw new Error("Task ID를 응답받지 못했습니다.");
           }
        }
      } catch (err: any) {
         if (progressInterval) clearInterval(progressInterval);
         console.error("Backend Task Error:", err);
         setResultImage(null);
         setResultCaption(null);
         showToast(`이미지 생성 실패: ${err.message || '알 수 없는 오류'}\n크레딧이 전액 환급되었습니다.`);
         
         // 환불 처리
         if (user) {
            const { data: latestProfile } = await supabase.from('profiles').select('credits').eq('id', user.id).single();
            const currentDBCredits = latestProfile?.credits ?? userCredits;
            const newCredits = currentDBCredits + generationCost;
            setUserCredits(newCredits);
            await supabase.from('profiles').update({ credits: newCredits }).eq('id', user.id);
            /* const { error: txError } = await supabase.from('credit_transactions').insert([{
               user_id: user.id,
               type: 'refund',
               amount: generationCost,
               description: 'AI 헤어모델 생성 실패 환불'
            }]); */
            window.dispatchEvent(new Event('credits_updated'));
         }
         setIsGenerating(false);
         return;
      }
      
      
      try {
        if (user) {
          await checkAndRewardReferralActivity(user.id);
        }
      } catch (err) {
        console.error(err);
      }

      // Move to preview tab on mobile after generation
      if (isMobile) {
        setActiveTab('preview');
      }

    } catch (error: any) {
      console.error("Simulation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const convertBase64ToJpegBlob = async (base64Str: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Canvas context is not available"));
          return;
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Canvas toBlob failed"));
          }
        }, 'image/jpeg', 0.95);
      };
      img.onerror = () => reject(new Error("이미지 로드 중 오류가 발생했습니다. (Base64 파싱 실패)"));
      img.src = base64Str.startsWith('data:') ? base64Str : `data:image/jpeg;base64,${base64Str}`;
    });
  };

  const compressImageFileOrBase64 = async (fileOrBase64: File | string, maxDimension = 1024): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Canvas 2D context not available"));
          return;
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], `compressed_${Date.now()}.jpg`, { type: 'image/jpeg' });
            resolve(compressedFile);
          } else {
            reject(new Error("Failed to compress canvas to blob"));
          }
        }, 'image/jpeg', 0.85);
      };

      img.onerror = () => {
        reject(new Error("Failed to load image for compression"));
      };

      if (typeof fileOrBase64 === 'string') {
        img.src = fileOrBase64.startsWith('data:') ? fileOrBase64 : `data:image/jpeg;base64,${fileOrBase64}`;
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result && typeof e.target.result === 'string') {
            img.src = e.target.result;
          } else {
            reject(new Error("File read failure"));
          }
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(fileOrBase64);
      }
    });
  };

  const uploadToNcpServer = async (fileOrBase64: File | string): Promise<string> => {
    let file: File | Blob;
    try {
      console.log("[NCP Upload] Compressing image before uploading to avoid 413...");
      file = await compressImageFileOrBase64(fileOrBase64, 1024);
    } catch (compressErr) {
      console.warn("Failed to compress image, using fallback parsing:", compressErr);
      let fileExt = 'jpg';
      if (typeof fileOrBase64 === 'string') {
         if (fileOrBase64.startsWith('http')) return fileOrBase64;
         
         const arr = fileOrBase64.split(',');
         const mimeMatch = arr[0].match(/:(.*?);/);
         const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
         fileExt = mimeType.split('/')[1] || 'jpg';
         const bstr = atob(arr[1] || arr[0]);
         let n = bstr.length;
         const u8arr = new Uint8Array(n);
         while(n--){
           u8arr[n] = bstr.charCodeAt(n);
         }
         file = new File([u8arr], `upload_${Date.now()}.${fileExt}`, {type: mimeType});
      } else {
         file = fileOrBase64;
      }
    }

    const fieldNames = ['file', 'image', 'images', 'upload', 'sourceImage'];
    let lastError = null;
    const token = localStorage.getItem('ncp_access_token');

    for (const field of fieldNames) {
      const formData = new FormData();
      formData.append(field, file);
      
      try {
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Native fetch bypasses Axios' header-merging bugs and correctly sets boundary
        const response = await fetch('/api/core/faceswap/upload', {
          method: 'POST',
          headers: headers,
          body: formData
        });
        
        if (!response.ok) {
          const errMsg = await response.text();
          throw new Error(`HTTP ${response.status}: ${errMsg || response.statusText}`);
        }
        
        const resData = await response.json();
        const url = resData?.url || resData?.data?.url || resData?.imageUrl || resData?.data;
        if (url && typeof url === 'string') return url;
      } catch (err: any) {
        lastError = err;
        console.warn(`NCP Upload failed with field '${field}':`, err.message);
      }
    }
    
    console.warn("All NCP upload attempts failed, falling back to Supabase:", lastError?.message || 'Unknown');
    // Fallback to storing in Supabase bucket to keep the user flow functional!
    return await uploadToStorage(fileOrBase64, 'models');
  };

  const uploadToSupabase = async (base64Image: string) => {
    // 1. Convert to JPEG blob to ensure Instagram compatibility
    const jpegBlob = await convertBase64ToJpegBlob(base64Image);

    const fileName = `ig_share_${Date.now()}_${Math.floor(Math.random()*1000)}.jpg`;
    
    // 2. Upload to Supabase 'models' bucket
    const { data, error } = await supabase.storage.from('models').upload(fileName, jpegBlob, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: false
    });

    if (error) {
      throw new Error("이미지 업로드에 실패했습니다. 관리자에게 문의하세요.");
    }

    const { data: urlData } = supabase.storage.from('models').getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleShare = async () => {
    if (isUploading) return;
    if (!resultImage) {
      showToast("먼저 AI 모델 이미지를 생성해 주세요.");
      return;
    }

    const captionText = resultCaption 
      ? `${resultCaption.caption}\n\n${resultCaption.tags.map(t => `#${t}`).join(' ')}` 
      : 'AI 헤어모델 스튜디오로 완성한 나만의 스타일!';

    const accountStr = localStorage.getItem('ig_account');
    let useDirectShare = true;
    
    if (accountStr) {
      if (window.confirm("인스타그램 연동 계정이 감지되었습니다.\n계정에 자동으로 백그라운드 게시를 원하시면 [확인]을, 휴대폰 인스타그램 앱으로 직접 바로 공유하려면 [취소]를 눌러주세요.")) {
        useDirectShare = false;
      }
    }

    if (useDirectShare) {
      // -------------------------------------------------------------------------
      // 1. Copy the caption and tags to the clipboard
      // -------------------------------------------------------------------------
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(captionText);
        } else {
          const textArea = document.createElement("textarea");
          textArea.value = captionText;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
        }
      } catch (e) {
        console.warn("Clipboard copy failed, proceeding anyway", e);
      }

      // -------------------------------------------------------------------------
      // 2. Check client features
      // -------------------------------------------------------------------------
      const ua = navigator.userAgent || navigator.vendor;
      const isIOS = /iPad|iPhone|iPod/.test(ua);
      const isAndroid = /Android/.test(ua);

      // -------------------------------------------------------------------------
      // 3. Initiate Image Download & Native/Intent Launch
      // -------------------------------------------------------------------------
      showToast("인스타그램 피드용 캡션이 클립보드에 복사되었습니다!\n이미지를 저장한 후 인스타그램에 붙여넣어 바로 공유해 보세요.");

      try {
        const link = document.createElement('a');
        link.href = resultImage;
        link.download = `brand_hair_model_${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (dlErr) {
        console.error("Download failed, trying background download...", dlErr);
      }

      // Wait a moment for download trigger, then deep link to Instagram App
      setTimeout(() => {
        if (isIOS) {
          window.location.href = "instagram://camera";
          setTimeout(() => {
            window.location.href = "instagram://app";
          }, 1200);
        } else if (isAndroid) {
          window.location.href = "intent://instagram.com/#Intent;package=com.instagram.android;scheme=https;end";
        } else {
          window.open('https://instagram.com', '_blank');
        }
      }, 1500);
      return;
    }

    const account = JSON.parse(accountStr!);

    setIsUploading(true);

    try {
        const textToPublish = `${resultCaption?.caption}\n\n${resultCaption?.tags.map(t => `#${t}`).join(' ')}`;

        let publicImageUrl = resultImage;

        // 인스타그램 Graph API는 로컬 blob을 인식하지 못하므로, 퍼블릭 URL로 변경해줍니다.
        // 그리고 인스타그램은 JPEG/PNG 형태만 허용합니다.
        if (resultImage?.startsWith('blob:') || resultImage?.startsWith('data:')) {
            if (!hairImage?.base64) {
                 throw new Error("업로드할 원본 이미지(Base64) 데이터를 찾을 수 없습니다.");
            }
            publicImageUrl = await uploadToSupabase(hairImage.base64);
        }

        if (!publicImageUrl) {
            throw new Error("유효한 퍼블릭 이미지 URL 생성에 실패했습니다.");
        }

        // 1. Create Media Container
        const createRes = await fetch(`https://graph.facebook.com/v19.0/${account.igId}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: publicImageUrl,
            caption: textToPublish,
            access_token: account.accessToken
          })
        }).catch(err => {
          if (err.message === 'Failed to fetch') {
            throw new Error('인스타그램 API 서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
          }
          throw err;
        });
        const createData = await createRes.json();

        if (createData.error) {
          throw new Error("인스타그램 컨테이너 생성 실패: " + (createData.error.error_user_msg || createData.error.message));
        }

        // 인스타그램 미디어 컨테이너 상태 폴링 (최대 10회, 3초 간격)
        let isReady = false;
        let attempts = 0;
        let lastStatus = "";
        
        while (!isReady && attempts < 10) {
            const statusRes = await fetch(`https://graph.facebook.com/v19.0/${createData.id}?fields=status_code,status&access_token=${account.accessToken}`)
              .catch(err => {
                if (err.message === 'Failed to fetch') {
                  throw new Error('인스타그램 서버와 통신 중 연결이 끊어졌습니다. 네트워크 상태를 확인해주세요.');
                }
                throw err;
              });
            const statusData = await statusRes.json();
            
            lastStatus = statusData.status_code;
            
            if (statusData.status_code === 'FINISHED' || statusData.status_code === 'PUBLISHED') {
                isReady = true;
            } else if (statusData.status_code === 'ERROR') {
                throw new Error("컨테이너 상태: ERROR (업로드한 이미지가 인스타그램 규격에 맞지 않거나 접근할 수 없습니다.)");
            } else if (statusData.status_code === 'EXPIRED') {
                throw new Error("컨테이너 상태: EXPIRED (인스타그램 서버에서 처리 시간이 초과되었습니다.)");
            }
            
            if (!isReady) {
              await new Promise(r => setTimeout(r, 3000));
              attempts++;
            }
        }

        if (!isReady) {
            console.warn(`상태 확인 불가(${lastStatus})로 발행을 강제 시도합니다.`);
        }

        // 2. Publish the Container
        const publishRes = await fetch(`https://graph.facebook.com/v19.0/${account.igId}/media_publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creation_id: createData.id,
            access_token: account.accessToken
          })
        }).catch(err => {
          if (err.message === 'Failed to fetch') {
            throw new Error('최종 게시물 발행 중 서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
          }
          throw err;
        });
        const publishData = await publishRes.json();

        if (publishData.error) {
          throw new Error('게시물 발행 실패: ' + (publishData.error.error_user_msg || publishData.error.message || '알 수 없는 오류'));
        }

        showToast("인스타그램에 게시물이 성공적으로 등록되었습니다!");

        // 3. Open Instagram native app so the user can see their post. 
        // If not installed, send to App Store.
        const ua = navigator.userAgent || navigator.vendor;
        const isIOS = /iPad|iPhone|iPod/.test(ua);
        const isAndroid = /Android/.test(ua);

        if (isIOS) {
            window.location.href = "instagram://app";
            setTimeout(() => {
                window.location.href = "https://apps.apple.com/kr/app/instagram/id389801252";
            }, 2000);
        } else if (isAndroid) {
            window.location.href = "intent://instagram.com/#Intent;package=com.instagram.android;scheme=https;end";
        } else {
            window.open('https://instagram.com', '_blank');
        }

    } catch (err: any) {
        console.error('Sharing failed', err);
        const errorMessage = err.message || '알 수 없는 오류가 발생했습니다.';
        
        let extraInfo = "";
        if (errorMessage.includes("Only photo or video") || errorMessage.includes("접근할 수 없습니다")) {
             extraInfo = "\n\n잠시 후 다시 시도해보세요.";
        }
        
        showToast(`공유 실패:\n${errorMessage}${extraInfo}`);
    } finally {
        setIsUploading(false);
    }
  };

  if (!user) return <div className="min-h-screen bg-bg-base flex items-center justify-center">Loading...</div>;

  if (showDeviceWarning && activeTab === 'creation') {
    return (
      <div className="min-h-screen bg-bg-base pt-32 pb-20 px-4 text-center flex flex-col items-center">
        <div className="bg-white p-10 rounded-[40px] shadow-2xl max-w-md border border-gray-100">
           <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Camera className="w-10 h-10 text-brand-primary" />
           </div>
           <h2 className="text-2xl font-black text-gray-900 mb-4">모바일 환경에서 사용하세요!</h2>
           <p className="text-text-light font-medium leading-relaxed mb-8">
              AI 헤어모델 스튜디오는 현장에서의 직접 촬영과 빠른 공유를 위해 모바일 환경에 최적화되어 있습니다.<br/>스마트폰으로 접속하여 원활하게 사용해보세요.
           </p>
           <button 
             onClick={() => setShowDeviceWarning(false)}
             className="w-full bg-brand-primary text-white font-bold py-4 rounded-2xl hover:bg-indigo-600 transition-all mb-4"
           >
              무시하고 계속하기
           </button>
           <button 
             onClick={() => navigate('/')}
             className="w-full bg-gray-50 text-gray-500 font-bold py-4 rounded-2xl hover:bg-gray-100 transition-all"
           >
              홈으로 돌아가기
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-bg-base h-screen overflow-y-auto no-scrollbar ${isMobile ? 'pt-0 pb-0 overflow-hidden' : 'pt-24 pb-20'}`}>
      {/* Toast Message */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            key="ai-page-toast"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] bg-gray-900 border border-gray-700 shadow-2xl rounded-2xl px-6 py-4 max-w-[90vw] w-max text-white text-[14px] text-center font-medium leading-relaxed"
          >
            {toastMessage.split('\n').map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`${isMobile ? 'w-full h-full p-0 flex flex-col' : 'max-w-7xl px-4 sm:px-6 lg:px-10 mx-auto flex flex-col'}`}>
        
        {!isMobile && (
          <div className="text-center mb-12">
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              {userName ? `${userName} 원장님 환영합니다🎉` : '환영합니다!'}
            </h2>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl font-[800] tracking-[-0.03em]"
            >
              AI <span className="gradient-text">헤어모델</span> 스튜디오
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-text-light max-w-2xl mx-auto mt-4 text-lg font-medium"
            >
              나만의 고품질 시술 포트폴리오를 만들어보세요.
            </motion.p>
          </div>
        )}

        <div className={`w-full flex-1 ${isMobile ? 'h-full flex overflow-hidden' : 'flex justify-center mt-10 lg:mt-0'}`}>
          <div className={`${isMobile ? 'h-full w-full bg-white relative flex flex-col overflow-hidden' : 'flex flex-row gap-12 sm:gap-20 lg:gap-32 items-center justify-center transform origin-top scale-[0.55] sm:scale-75 lg:scale-95 px-10'}`}>
            
            {/* Phone 1 View (Creation) */}
            <div className={`
              ${isMobile ? 'flex-1 h-full w-full' : 'relative w-[375px] h-[780px] bg-white rounded-[60px] border-[12px] border-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden shrink-0 flex flex-col z-20 ring-1 ring-gray-100/50'}
              ${isMobile && activeTab === 'preview' ? 'hidden' : 'flex flex-col'}
            `}>
              {!isMobile && (
                <>
                  <div className="absolute inset-x-0 inset-y-0 border-[0.5px] border-black/5 rounded-[43px] pointer-events-none z-40" />
                  <div className="absolute top-0 inset-x-0 h-[34px] bg-[#F1F1F1] rounded-b-[24px] w-36 mx-auto z-50 flex items-center justify-center">
                    <div className="w-14 h-1.5 rounded-full bg-black/[0.08]"></div>
                  </div>
                </>
              )}
            
            {/* Loading Overlay inside Phone 1 */}
            <AnimatePresence>
              {isUploading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 flex-col"
                >
                  <Loader2 className="w-12 h-12 text-white animate-spin mb-4" />
                  <p className="text-white font-bold text-[16px]">인스타그램 자동 업로드 중...</p>
                </motion.div>
              )}
              
              {isGenerating && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                >
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-3xl p-6 w-full text-center shadow-2xl relative overflow-hidden flex flex-col items-center"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
                      <motion.div 
                        animate={{ width: `${generatingProgress}%` }}
                        transition={{ duration: 0.3 }}
                        className="h-full bg-brand-primary"
                      />
                    </div>
                    <div className="w-14 h-14 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Wand2 className="w-7 h-7 text-brand-primary animate-pulse" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">AI 합성 진행 중</h3>
                    <div className="text-brand-primary font-extrabold text-[20px] mb-3">{generatingProgress}%</div>
                    <p className="text-gray-500 font-medium text-[12px] leading-relaxed mb-6 whitespace-pre-line text-center">
                      {generatingStatus}
                    </p>
                  </motion.div>
                </motion.div>
              )}
              
              {showCustomStyleModal && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                >
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-[24px] p-6 w-full max-w-sm text-center shadow-2xl relative"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-4">시술명 직접 입력</h3>
                    <input 
                       type="text" 
                       value={customStyleInput}
                       onChange={(e) => setCustomStyleInput(e.target.value)}
                       placeholder="예: 발레아쥬 옴브레 (여러개 선택 가능)" 
                       className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-gray-800 text-[14px]"
                       autoFocus
                       onKeyDown={(e) => {
                         if (e.key === 'Enter') {
                           e.preventDefault();
                           handleAddCustomStyle();
                         }
                       }}
                    />
                    <div className="flex gap-2">
                       <button onClick={() => setShowCustomStyleModal(false)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 text-[14px] rounded-xl hover:bg-gray-200">취소</button>
                       <button onClick={handleAddCustomStyle} className="flex-1 bg-[#5D67D8] text-white font-bold py-3 text-[14px] rounded-xl hover:bg-indigo-600">추가하기</button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content Container */}
            <div className={`flex flex-col pb-0 h-full pt-10 px-0`}>
              {/* Header */}
              <div className="flex justify-between items-center mb-4 shrink-0 pl-1 pr-6">
                 <div className="flex items-center gap-2">
                    <div className="bg-indigo-50 p-1.5 rounded-full text-indigo-600">
                       <Sparkles className="w-4 h-4 fill-current" />
                    </div>
                    <div className="font-[900] text-[15px] tracking-tight text-[#1a1a1a]">
                       AI HAIR STUDIO
                    </div>
                 </div>
                 <div className="bg-[#EBEFFF] text-[#4C51F7] px-4 py-1.5 rounded-full text-[13px] font-extrabold shadow-sm border border-indigo-100/50">
                    {userCredits} C
                 </div>
              </div>

                  {/* Non-scrollable content area - optimized to fit the screen without scrolling */}
                  <div className="flex-1 flex flex-col min-h-0 pt-0 pb-0">

                {/* Upload Box */}
                <div className="shrink-0 flex items-center justify-center px-6 py-0">
                  <button 
                    onClick={() => hairInputRef.current?.click()}
                    className={`w-full aspect-square rounded-[40px] border-2 border-dashed flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-all cursor-pointer relative overflow-hidden group ${hairImage ? 'border-indigo-200' : 'border-[#E5E7EB] bg-[#F9FAFB] text-gray-400'}`}
                  >
                     {hairImage ? (
                       <>
                          <img src={hairImage.url} alt="Uploaded hair" className="absolute inset-0 w-full h-full object-cover group-hover:opacity-40 transition-opacity" />
                          <RefreshCw className="w-8 h-8 text-white relative z-10 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                       </>
                     ) : (
                       <div className="flex flex-col items-center gap-3">
                          <Camera className="w-10 h-10 text-gray-300" strokeWidth={1.2} />
                       </div>
                     )}
                  </button>
                  <input type="file" accept="image/*" className="hidden" ref={hairInputRef} onChange={(e) => handleFileUpload(e, 'hair')} />
                </div>

                {/* Controls Area (Fixed at bottom before button) */}
                <div className="shrink-0 flex flex-col gap-4 px-6 pt-2">
                  {/* Style Selection Block */}
                  <div className="flex flex-col gap-3">
                     <div className="flex items-center justify-between px-1">
                        <div className="text-[13px] font-bold text-gray-800">시술명 선택</div>
                        <div className="flex bg-[#F3F4F6] rounded-full p-0.5 ml-auto">
                           <button onClick={() => { setStyleGender('female'); setSelectedHairStyles([]); }} className={`px-4 py-1 rounded-full text-[11px] transition-all ${styleGender === 'female' ? 'bg-white text-gray-900 font-bold shadow-sm' : 'text-gray-500 font-medium'}`}>여자</button>
                           <button onClick={() => { setStyleGender('male'); setSelectedHairStyles([]); }} className={`px-4 py-1 rounded-full text-[11px] transition-all ${styleGender === 'male' ? 'bg-white text-gray-900 font-bold shadow-sm' : 'text-gray-500 font-medium'}`}>남자</button>
                        </div>
                     </div>
                     <div className="relative w-full overflow-hidden" ref={stylesContainerRef}>
                        <motion.div 
                          className="flex items-center gap-2 w-max px-2 py-2"
                          drag="x"
                          dragConstraints={stylesContainerRef}
                          dragElastic={0.1}
                          dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                          whileTap={{ cursor: "grabbing" }}
                        >
                        <button 
                          onClick={() => setShowCustomStyleModal(true)}
                          className="shrink-0 h-[34px] px-3 rounded-full border border-dashed flex items-center justify-center cursor-pointer transition-all border-gray-300 bg-gray-50 text-gray-500 hover:border-brand-primary hover:text-brand-primary"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          <span className="text-[12px] font-medium">직접입력</span>
                        </button>
                        {hairStyles[styleGender].map((style, index) => (
                           <div 
                             key={`${style}-${index}`}
                             onClick={() => toggleHairStyle(style)} 
                             className={`shrink-0 h-[34px] px-4 rounded-full text-[12px] whitespace-nowrap cursor-pointer flex items-center transition-all border ${selectedHairStyles.includes(style) ? 'bg-indigo-50 text-indigo-600 border-indigo-200 font-bold' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300'}`}
                           >
                             {style}
                           </div>
                        ))}
                        </motion.div>
                     </div>
                  </div>

                  {/* Separator Line */}
                  <div className="h-px w-full bg-gray-100/80 mx-auto" />

                  {/* Face Model Selection Block */}
                  <div className="flex flex-col gap-3 mb-2">
                     <div className="flex items-center justify-between px-1">
                        <div className="text-[13px] font-bold text-gray-800">모델 얼굴 선택</div>
                        <div className="flex bg-[#F3F4F6] rounded-full p-0.5 ml-auto">
                           <button onClick={() => setModelGender('female')} className={`px-4 py-1 rounded-full text-[11px] transition-all ${modelGender === 'female' ? 'bg-white text-gray-900 font-bold shadow-sm' : 'text-gray-500 font-medium'}`}>여자</button>
                           <button onClick={() => setModelGender('male')} className={`px-4 py-1 rounded-full text-[11px] transition-all ${modelGender === 'male' ? 'bg-white text-gray-900 font-bold shadow-sm' : 'text-gray-500 font-medium'}`}>남자</button>
                        </div>
                     </div>
                     <div className="relative w-full overflow-hidden" ref={facesContainerRef}>
                        <motion.div 
                          className="flex items-center gap-3 w-max px-4 py-5"
                          drag="x"
                          dragConstraints={facesContainerRef}
                          dragElastic={0.1}
                          dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                          whileTap={{ cursor: "grabbing" }}
                        >
                        <button onClick={() => faceInputRef.current?.click()} className={`shrink-0 w-14 h-14 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${modelFace && !modelFace.isPreset ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>
                           {modelFace && !modelFace.isPreset && modelFace.url ? (
                              <img src={modelFace.url} className="w-full h-full object-cover rounded-full p-[1px]" alt="Custom face" draggable={false} />
                           ) : (
                              <Plus className="w-5 h-5 text-gray-400" />
                           )}
                        </button>
                        <input type="file" accept="image/*" className="hidden" ref={faceInputRef} onChange={(e) => handleFileUpload(e, 'face')} />
                        
                        {isLoadingModels ? (
                          <div className="flex items-center justify-center h-12 w-28">
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                          </div>
                        ) : (
                          modelPresets[modelGender].map((preset) => (
                             <button 
                               key={preset.id}
                               onClick={() => setModelFace({ isPreset: true, url: preset.image, desc: preset.desc })}
                               className={`shrink-0 w-12 h-12 rounded-full p-[1.5px] cursor-pointer transition-all ${modelFace?.url === preset.image ? 'border-2 border-indigo-500 shadow-md scale-125 z-10 bg-white ring-4 ring-indigo-50' : 'border-2 border-transparent hover:border-gray-200'}`}
                             >
                                <div className={`w-full h-full rounded-full overflow-hidden transition-all ${modelFace?.url !== preset.image ? 'opacity-70 grayscale hover:opacity-100 hover:grayscale-0' : ''}`}>
                                 <img src={preset.image} className="w-full h-full object-cover" alt={preset.desc} referrerPolicy="no-referrer" draggable={false} />
                               </div>
                             </button>
                          ))
                        )}
                        </motion.div>
                     </div>
                  </div>
                </div>
                  </div>
               </div>

               {/* Bottom Generate Button */}
              <div className="mt-auto pb-0 shrink-0 px-8">
                 <button onClick={handleGenerateClick} disabled={isGenerating} className="w-full bg-[#5D67D8] text-white font-bold text-[16px] py-4.5 rounded-[24px] shadow-lg shadow-indigo-500/20 flex justify-center items-center gap-2.5 hover:bg-indigo-600 active:scale-[0.98] transition-all disabled:opacity-50 relative overflow-hidden">
                   {isGenerating ? (
                      <>
                         <Loader2 className="w-5 h-5 animate-spin" />
                         <span>생성 중...</span>
                      </>
                   ) : (
                      <>
                         <Sparkles className="w-5 h-5 fill-current" />
                         <span className="tracking-tight">AI 모델 생성 딸깍</span>
                      </>
                   )}
                 </button>
              </div>

              <AnimatePresence>
                {showCreditModal && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
                  >
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.95, opacity: 0, y: 10 }}
                      className="bg-white rounded-3xl p-6 w-full max-w-sm mx-auto shadow-2xl"
                    >
                      <div className="flex justify-center mb-4">
                         <div className="w-16 h-16 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center">
                            <Wand2 className="w-8 h-8" />
                         </div>
                      </div>
                      <h3 className="text-xl font-black text-center text-gray-900 mb-2">'{generationCost}' 크레딧이 차감됩니다.<br/>생성하시겠습니까?</h3>
                      <p className="text-center text-sm text-gray-500 mb-6 font-medium">이미지 생성을 위해 정해진 크레딧이 차감됩니다.</p>
                      
                      <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100 space-y-3">
                         <div className="flex justify-between items-center text-sm font-bold">
                            <span className="text-gray-500">차감 크레딧</span>
                            <span className="text-red-500">-{generationCost} C</span>
                         </div>
                         <div className="w-full h-px bg-gray-200"></div>
                         <div className="flex justify-between items-center text-sm font-bold">
                            <span className="text-gray-500">잔여 크레딧 (예상)</span>
                            <span className="text-indigo-600 font-black">{Math.max(0, userCredits - generationCost)} C</span>
                         </div>
                      </div>

                      <div className="flex gap-3">
                         <button onClick={() => setShowCreditModal(false)} className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                            취소
                         </button>
                         <button onClick={confirmGenerate} className="flex-1 py-3 rounded-xl font-bold bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/20">
                            확인
                         </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Phone 2 View (Preview) */}
            <div className={`
              ${isMobile ? 'flex-1 h-full w-full' : 'relative w-[375px] h-[780px] bg-white rounded-[60px] border-[12px] border-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden shrink-0 z-20 ring-1 ring-gray-100/50'}
              ${isMobile && activeTab === 'creation' ? 'hidden' : 'flex flex-col'}
            `}>
              {!isMobile && (
                <>
                  <div className="absolute inset-x-0 inset-y-0 border-[0.5px] border-black/5 rounded-[43px] pointer-events-none z-40" />
                  <div className="absolute top-0 inset-x-0 h-[34px] bg-[#F1F1F1] rounded-b-[24px] w-36 mx-auto z-50 flex items-center justify-center">
                    <div className="w-14 h-1.5 rounded-full bg-black/[0.08]"></div>
                  </div>
                </>
              )}
              
              {/* Instagram Layout */}
              <div className="flex flex-col h-full bg-white">
                {/* Instagram Header */}
                <div className="pt-10 pb-3 border-b border-gray-50 flex items-center justify-center shrink-0 relative">
                  {isMobile && (
                    <button onClick={() => setActiveTab('creation')} className="absolute left-4 top-10 text-gray-800">
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                  )}
                  <span className="font-bold text-[18px] tracking-tight text-gray-800">instagram</span>
                </div>
                
                <div className="flex-1 overflow-y-auto no-scrollbar">
                  {/* Post Header */}
                  <div className="flex items-center justify-between px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-100 overflow-hidden">
                        <AvatarImage url={igAccount?.profileUrl || avatarUrl || user?.user_metadata?.avatar_url} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[12.5px] font-bold text-gray-900 leading-none">{igAccount ? igAccount.username : (userName || '헤어딜')}</span>
                        <span className="text-[10px] text-gray-500 mt-1">Seoul</span>
                      </div>
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </div>

                  {/* Post Image Area */}
                  <div className="w-full aspect-square bg-[#F9FAFB] flex items-center justify-center relative overflow-hidden">
                    {resultImage ? (
                      <img src={resultImage} className="w-full h-full object-cover" alt="Generated" />
                    ) : (
                      <div className="flex flex-col items-center gap-3 px-10 text-center">
                        <p className="text-gray-300 text-[13px] font-medium leading-relaxed">
                          왼쪽에서 사진을 업로드하고<br />
                          AI 모델을 생성해보세요.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Interactions */}
                  <div className="px-3 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Heart className="w-[22px] h-[22px] text-gray-900" strokeWidth={1.8} />
                        <MessageCircle className="w-[22px] h-[22px] text-gray-900" strokeWidth={1.8} />
                        <button onClick={handleShare} disabled={isUploading || !resultImage} className="disabled:opacity-50 transition-opacity">
                          <Send className="w-[22px] h-[22px] text-gray-900" strokeWidth={1.8} />
                        </button>
                      </div>
                      <Bookmark className="w-[22px] h-[22px] text-gray-900" strokeWidth={1.8} />
                    </div>
                    
                    <div className="mt-3.5">
                      <p className="font-bold text-[13px] text-gray-900">좋아요 0개</p>
                      <div className="mt-1.5 min-h-16">
                        {resultCaption ? (
                          <div className="text-[13.5px] text-gray-900 leading-relaxed whitespace-pre-wrap">
                            <span className="font-bold mr-1.5 text-[13px]">{igAccount ? igAccount.username : (userName || '헤어딜')}</span>
                            {resultCaption.caption}
                            <div className="text-indigo-600 mt-1 flex flex-wrap gap-1">
                              {resultCaption.tags.map((t, idx) => <span key={`${t}-${idx}`}>#{t}</span>)}
                            </div>
                          </div>
                        ) : (
                          <p className="text-[12.5px] text-gray-300 italic">캡션이 여기에 표시됩니다.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instagram Footer */}
                <div className="shrink-0 h-[65px] border-t border-gray-100 flex items-center justify-around px-2 bg-white pb-3">
                   <Home className="w-[24px] h-[24px] text-gray-900 fill-current" />
                   <Search className="w-[24px] h-[24px] text-gray-900" strokeWidth={2} />
                   <div className="w-6 h-6 border-2 border-gray-900 rounded-md flex items-center justify-center">
                     <Plus className="w-4 h-4 text-gray-900" strokeWidth={3} />
                   </div>
                   <Heart className="w-[24px] h-[24px] text-gray-900" strokeWidth={2} />
                   <div className="w-7 h-7 rounded-full border border-gray-100 overflow-hidden">
                      <AvatarImage url={igAccount?.profileUrl || avatarUrl || user?.user_metadata?.avatar_url} className="w-full h-full object-cover" />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
