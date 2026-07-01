import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Camera, PlusSquare, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Home, Search, RefreshCw, Wand2, Loader2, Instagram } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { useSiteContext } from '../context/SiteContext';
import { supabase } from '../supabase';
import { AvatarImage } from './AvatarImage';

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

export default function AiMarketingDemo({ user }: { user?: User | null; key?: React.Key }) {
  const navigate = useNavigate();
  const { settings } = useSiteContext();
  const aiDemo = settings.aiDemo;

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const handleProfileUpdate = () => {
      const tempBlob = localStorage.getItem('temp_profile_blob');
      if (tempBlob) {
        setAvatarUrl(tempBlob);
      }
    };
    handleProfileUpdate();
    window.addEventListener('profile_updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profile_updated', handleProfileUpdate);
    };
  }, []);

  useEffect(() => {
    if (user?.user_metadata?.avatar_url && !avatarUrl) {
      setAvatarUrl(user.user_metadata.avatar_url);
    }
  }, [user]);

  // AI Hair Model Logic States
  const [modelPresets, setModelPresets] = useState<{ female: any[], male: any[] }>(DEFAULT_MODEL_PRESETS);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [hairImage, setHairImage] = useState<{ url: string, base64: string, mimeType: string } | null>(null);
  const [hairStyleName, setHairStyleName] = useState<string>('');
  const [modelGender, setModelGender] = useState<'female' | 'male'>('female');
  const [modelFace, setModelFace] = useState<{ isPreset: boolean, url?: string, desc?: string, base64?: string, mimeType?: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultCaption, setResultCaption] = useState<{ caption: string, tags: string[] } | null>(null);
  const [showHearts, setShowHearts] = useState(false);

  const hairInputRef = useRef<HTMLInputElement>(null);
  const faceInputRef = useRef<HTMLInputElement>(null);
  const styleContainerRef = useRef<HTMLDivElement>(null);
  const faceContainerRef = useRef<HTMLDivElement>(null);
  const feedContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (resultImage) {
      setShowHearts(true);
      const timer = setTimeout(() => setShowHearts(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [resultImage]);

  useEffect(() => {
    let isMounted = true;
    const fetchModels = async () => {
      try {
        let finalData: any[] = null;
        let lastError = null;

        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const { data: modelsData, error } = await supabase
              .from('ai_models')
              .select('*')
              .eq('is_active', true)
              .order('sort_order', { ascending: true });

            if (!error && modelsData) {
              finalData = modelsData;
              break;
            } else {
              lastError = error;
              console.warn(`[AiModels] Fetch attempt ${attempt} failed:`, error);
              
              if (error?.message?.includes('sort_order') || error?.code === '42703') {
                const { data: fallbackData, error: fbError } = await supabase.from('ai_models').select('*');
                if (!fbError && fallbackData) {
                  finalData = fallbackData;
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

        if (finalData && finalData.length > 0) {
            const activeModels = finalData.filter(m => m.is_active !== false);
            const female = activeModels.filter(m => m.gender === 'female').map(m => ({ id: m.id, desc: m.description, image: m.image_url }));
            const male = activeModels.filter(m => m.gender === 'male').map(m => ({ id: m.id, desc: m.description, image: m.image_url }));
            if (female.length > 0 || male.length > 0) {
               setModelPresets({ female, male });
            } else {
               setModelPresets(DEFAULT_MODEL_PRESETS);
            }
        } else if (finalData?.length === 0) {
           setModelPresets(DEFAULT_MODEL_PRESETS);
        } else {
           console.error("DB connection persists to drop, using fallback models", lastError);
           setModelPresets(DEFAULT_MODEL_PRESETS);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to load models", err);
        setModelPresets(DEFAULT_MODEL_PRESETS);
      } finally {
        if (isMounted) setIsLoadingModels(false);
      }
    };
    fetchModels();
    return () => { isMounted = false; };
  }, []);

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

  const handleGenerate = async () => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('open-auth'));
      return;
    }
    if (!hairImage) {
      alert("뷰티 시술 이미지를 업로드해주세요.");
      return;
    }
    if (!hairStyleName.trim()) {
      alert("시술명을 선택해주세요.");
      return;
    }
    if (!modelFace) {
      alert("모델을 선택해주세요.");
      return;
    }

    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000)); 
      
      const captionTemplates = [
        `오늘 방문해주신 고객님의 맞춤 '${hairStyleName}' 디자인 ✂️✨\n\n고객님의 두상과 모질, 평소 스타일링 습관까지 꼼꼼하게 고려해서 가장 예쁜 볼륨감과 텍스처를 살려 디자인해 드렸어요. 툭 털어서 말리기만 해도 금방 샵에 다녀온 것처럼 손질이 너무 편하실 거예요! 분위기 변신 대성공이네요 💖\n\n올 봄, 나만의 찰떡 인생머리를 찾고 싶으시다면 편하게 문의주세요!`,
        `요즘 가장 사랑받는 '${hairStyleName}' 스타일링 🕊️\n\n특유의 부드럽고 세련된 무드를 극대화해 드렸습니다. 매일 아침 드라이할 시간 부족하신 분들께 강력 추천해 드려요! 가벼운 에센스 하나만 발라도 느낌 있게 완성됩니다.\n\n고객님의 니즈에 맞춰 1:1 맞춤 컨설팅 진행합니다. 예약 마감이 빠르니 서둘러 주세요! 🔥`,
        `단발/장발병 유발하는 완벽한 '${hairStyleName}' 💇‍♀️💕\n\n얼굴형을 보완해주는 디테일한 커트 라인과 얼굴빛을 살려주는 컬러의 조합! 시술 후 거울 보시고 찐으로 행복해하시던 고객님 모습이 아직도 눈에 선하네요. 만족도 200% 보장하는 디자인입니다.\n\n나만의 퍼스널 헤어, 지금 바로 경험해보세요.`
      ];

      const selectedCaption = captionTemplates[Math.floor(Math.random() * captionTemplates.length)];

      setResultImage(hairImage.url);
      setResultCaption({
        caption: `${selectedCaption}\n\n💌 예약 및 상담은 프로필 상단 링크\n📩 디자인 문의: DM`,
        tags: [
          hairStyleName.replace(/\s+/g, ''), 
          `${hairStyleName.replace(/\s+/g, '')}추천`,
          "헤어스타일", 
          "머리잘하는곳", 
          "인생머리", 
          "미용실추천"
        ]
      });

    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const triggerAuth = () => {
    if (user) return;
    window.dispatchEvent(new CustomEvent('open-auth'));
  };

  return (
    <section id="marketing" className={`py-24 overflow-hidden relative ${aiDemo.useWhiteBg ? 'bg-white' : 'bg-gray-50'}`}>
      <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        
        <div className="text-center mb-20">
          {aiDemo.showBadge && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-accent/10 text-brand-accent text-[11px] font-[800] mb-6 uppercase tracking-wider"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{aiDemo.badgeText}</span>
            </motion.div>
          )}
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-[800] mb-8 tracking-[-0.03em] leading-[1.1]"
            dangerouslySetInnerHTML={{ __html: aiDemo.title }}
          />
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.2 }}
            className="text-text-light max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed font-medium"
            dangerouslySetInnerHTML={{ __html: aiDemo.subtitle }}
          />
        </div>

        <div className="flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-row items-center justify-center gap-4 sm:gap-8 mb-28 sm:mb-32 lg:mb-36"
          >
            {aiDemo.appStoreImg && (
              <a href={aiDemo.appStoreLink || '#'} target="_blank" rel="noopener noreferrer" className="hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 drop-shadow-md lg:drop-shadow-lg group">
                  <img 
                    src={aiDemo.appStoreImg || undefined} 
                    alt="App Store Badge" 
                    className="h-10 sm:h-[52px] w-auto brightness-110 contrast-110"
                    referrerPolicy="no-referrer"
                  />
              </a>
            )}
            {aiDemo.playStoreImg && (
              <a href={aiDemo.playStoreLink || '#'} target="_blank" rel="noopener noreferrer" className="hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 drop-shadow-md lg:drop-shadow-lg group">
                  <img 
                    src={aiDemo.playStoreImg || undefined} 
                    alt="Google Play Badge" 
                    className="h-10 sm:h-[52px] w-auto"
                    referrerPolicy="no-referrer"
                  />
              </a>
            )}
          </motion.div>

          {/* Functional Wrapper */}
          <div className="w-[328px] sm:w-[510px] lg:w-[720px] h-[330px] sm:h-[495px] lg:h-[660px] relative flex justify-center mx-auto">
            
            {/* Login Overlay (Conditional) */}
            <AnimatePresence>
              {!user && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 flex items-center justify-center bg-white/20 rounded-[50px] transition-all border border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.4)] cursor-pointer overflow-hidden"
                  style={{ backdropFilter: `blur(${aiDemo.blurStrength}px)` }}
                  onClick={triggerAuth}
                >
                  <button className="bg-brand-primary text-white font-[800] px-8 py-4 sm:px-10 sm:py-5 lg:px-10 lg:py-5 rounded-full shadow-[0_15px_30px_-10px_rgba(90,103,216,0.6)] flex items-center gap-2 lg:gap-3 transform hover:scale-105 active:scale-95 transition-all text-sm sm:text-xl lg:text-2xl border-[3px] border-white/50">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
                    <span>{aiDemo.ctaText}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={`flex flex-row gap-4 sm:gap-10 lg:gap-20 items-center justify-center absolute top-0 transform origin-top scale-[0.5] sm:scale-75 lg:scale-100 ${!user ? 'outline outline-8 outline-black/5 rounded-[60px] p-2 bg-gradient-to-b from-black/5 to-transparent shadow-2xl' : ''} overflow-visible`}>
              
              {/* Phone 1: Portfolio (Functional Logic) */}
              <div className="relative w-[320px] h-[660px] bg-white rounded-[55px] border-[12px] border-white ring-1 ring-gray-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden shrink-0 flex flex-col z-20">
                <div className="absolute inset-x-0 inset-y-0 border-[0.5px] border-gray-100/50 rounded-[43px] pointer-events-none z-40" />
                <div className="absolute top-1.5 inset-x-0 h-[26px] bg-[#DCDCDC] rounded-[18px] w-28 mx-auto z-50 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40 absolute right-4"></div>
                </div>

                {/* Local Loader Overlay */}
                <AnimatePresence>
                  {isGenerating && (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                    >
                      <motion.div className="bg-white rounded-3xl p-6 w-full text-center shadow-2xl flex flex-col items-center">
                        <Wand2 className="w-8 h-8 text-brand-primary animate-pulse mb-3" />
                        <h3 className="text-sm font-bold text-gray-900">AI 합성 중...</h3>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="h-full flex flex-col pt-10 px-4 pb-4">
                  <div className="flex justify-between items-center mb-4 shrink-0">
                     <div className="flex items-center gap-1.5">
                        <div className="bg-indigo-50 p-1.5 rounded-full text-indigo-600">
                           <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="font-[900] text-sm leading-none text-gray-900">
                           AI HAIR STUDIO
                        </div>
                     </div>
                  </div>

                  <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col pb-4">
                    <div className="px-1">
                      <button 
                        onClick={() => hairInputRef.current?.click()}
                        className={`w-full aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 mb-4 shrink-0 relative overflow-hidden group transition-all ${hairImage ? 'border-brand-primary/50' : 'border-gray-200 bg-[#F8F9FA] text-gray-400'}`}
                      >
                         {hairImage ? (
                           <img src={hairImage.url} alt="hair" className="absolute inset-0 w-full h-full object-cover" />
                         ) : (
                           <Camera className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={1.5} />
                         )}
                      </button>
                    </div>
                    <input type="file" className="hidden" ref={hairInputRef} onChange={(e) => handleFileUpload(e, 'hair')} />

                    <div className="text-[11px] font-medium text-gray-800 mb-2 px-1">시술명 선택</div>
                    <div className="relative mb-4 h-12 w-full overflow-hidden" ref={styleContainerRef}>
                        <motion.div 
                          drag="x"
                          dragConstraints={styleContainerRef}
                          dragElastic={0.1}
                          dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                          className="flex gap-2 items-center shrink-0 cursor-grab active:cursor-grabbing w-max px-1 h-full py-0.5"
                        >
                            {['댄디컷', '리프컷', '애즈펌', '허쉬컷', '가일컷', '태슬컷', '시스루펌', '아이비리그컷'].map(style => (
                              <div 
                                key={style}
                                onClick={() => setHairStyleName(style)}
                                className={`px-4 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap cursor-pointer transition-colors shrink-0 border flex items-center justify-center ${hairStyleName === style ? 'bg-brand-primary text-white border-brand-primary font-bold' : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200'}`}
                              >
                                {style}
                              </div>
                            ))}
                        </motion.div>
                    </div>

                    <div className="flex justify-between items-center mb-3 px-1">
                      <div className="text-[11px] font-medium text-gray-800">모델 얼굴 선택</div>
                      <div className="flex bg-gray-100 rounded-full p-0.5 shrink-0 w-24">
                        <button onClick={() => setModelGender('female')} className={`flex-1 py-1 rounded-full text-center text-[9px] transition-colors ${modelGender === 'female' ? 'bg-white text-gray-800 font-bold shadow-xs' : 'text-gray-500 font-medium'}`}>여자</button>
                        <button onClick={() => setModelGender('male')} className={`flex-1 py-1 rounded-full text-center text-[9px] transition-colors ${modelGender === 'male' ? 'bg-white text-gray-800 font-bold shadow-xs' : 'text-gray-500 font-medium'}`}>남자</button>
                      </div>
                    </div>

                    <div className="relative py-1 shrink-0 overflow-hidden" ref={faceContainerRef}>
                       <motion.div 
                         key={modelGender}
                         drag="x"
                         dragConstraints={faceContainerRef}
                         dragElastic={0.1}
                         dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                         className="flex gap-3 shrink-0 cursor-grab active:cursor-grabbing w-max px-2"
                       >
                          {modelPresets[modelGender].map((preset: any) => (
                             <div 
                               key={preset.id}
                               onClick={() => setModelFace({ isPreset: true, url: preset.image })}
                               className={`w-14 h-14 rounded-full overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${modelFace?.url === preset.image ? 'border-indigo-500 scale-110 shadow-md ring-4 ring-indigo-50' : 'border-gray-200 grayscale opacity-70'}`}
                             >
                               <img src={preset.image} className="w-full h-full object-cover pointer-events-none" referrerPolicy="no-referrer" />
                             </div>
                          ))}
                       </motion.div>
                    </div>
                  </div>

                  <div className="pt-2 shrink-0">
                     <button onClick={handleGenerate} className="w-full bg-[#5A67D8] text-white font-bold text-[14px] py-4 rounded-2xl shadow-lg flex justify-center items-center gap-2 hover:bg-indigo-600 transition-all">
                         <Sparkles className="w-5 h-5" />
                         AI 모델 생성 딸깍
                     </button>
                  </div>
                </div>
              </div>

              {/* Phone 2: Feed (Functional Result) */}
              <div className="relative w-[320px] h-[660px] bg-white rounded-[55px] border-[12px] border-white ring-1 ring-gray-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden shrink-0 z-20">
                <div className="absolute inset-x-0 inset-y-0 border-[0.5px] border-gray-100/50 rounded-[43px] pointer-events-none z-40" />
                <div className="absolute top-1.5 inset-x-0 h-[26px] bg-[#DCDCDC] rounded-[18px] w-28 mx-auto z-50 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40 absolute right-4"></div>
                </div>
                <div className="h-full flex flex-col bg-white pt-8 relative">
                  <div className="h-11 flex items-center justify-center font-bold text-[16px] border-b border-gray-100 shrink-0 lowercase tracking-tighter text-gray-800">instagram</div>
                  <div className="flex-1 bg-white relative overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth" ref={feedContainerRef}>
                       <div className="px-3 py-3 flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden border border-gray-100">
                             <AvatarImage url={avatarUrl || user?.user_metadata?.avatar_url} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex flex-col">
                             <span className="text-xs font-[800]">{user?.user_metadata?.full_name || '원장님'}</span>
                             <span className="text-[10px] text-gray-400">Seoul</span>
                          </div>
                          <div className="ml-auto p-1">
                             <MoreHorizontal className="w-4 h-4 text-gray-400" />
                          </div>
                       </div>

                       <div className="w-full aspect-square bg-gray-50 relative overflow-hidden flex items-center justify-center">
                          {resultImage ? (
                            <>
                              <motion.img initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={resultImage} className="w-full h-full object-cover" />
                              <AnimatePresence>
                                {showHearts && (
                                  <div className="absolute inset-0 pointer-events-none">
                                    {[...Array(12)].map((_, i) => (
                                      <motion.div
                                        key={i}
                                        initial={{ 
                                          opacity: 0, 
                                          scale: 0,
                                          x: Math.random() * 200 - 100, 
                                          y: 100 
                                        }}
                                        animate={{ 
                                          opacity: [0, 1, 1, 0], 
                                          scale: [0.5, 1.2, 1, 0.8],
                                          y: -300,
                                          x: (Math.random() * 200 - 100) + (Math.sin(i) * 30)
                                        }}
                                        transition={{ 
                                          duration: 2 + Math.random(), 
                                          delay: Math.random() * 0.5,
                                          ease: "easeOut"
                                        }}
                                        className="absolute left-1/2 bottom-0 text-red-500"
                                      >
                                        <Heart className="w-8 h-8 fill-current" />
                                      </motion.div>
                                    ))}
                                  </div>
                                )}
                              </AnimatePresence>
                            </>
                          ) : (
                            <div className="text-gray-300 text-[10px] text-center px-6 leading-relaxed">
                               왼쪽에서 사진을 업로드하고<br/>AI 모델을 생성해보세요.
                            </div>
                          )}
                       </div>

                       <div className="px-3 py-3 flex gap-4">
                          <Heart className={`w-6 h-6 ${resultImage ? 'text-red-500 fill-red-500' : 'text-gray-900'}`} />
                          <MessageCircle className="w-6 h-6" />
                          <Send className="w-6 h-6" />
                          <div className="ml-auto">
                             <Bookmark className="w-6 h-6" />
                          </div>
                       </div>

                       <div className="px-3 text-[11px] pb-14">
                          <div className="font-bold mb-1">좋아요 {resultImage ? '1,502개' : '0개'}</div>
                          {resultCaption ? (
                            <div className="space-y-1.5">
                              <p className="whitespace-pre-wrap"><span className="font-bold mr-1">{user?.user_metadata?.full_name || 'HAIR_DEAL'}</span>{resultCaption.caption}</p>
                              <div className="flex flex-wrap gap-1">
                                 {resultCaption.tags.map(tag => (
                                   <span key={tag} className="text-blue-700">#{tag}</span>
                                 ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-300">캡션이 여기에 표시됩니다.</p>
                          )}
                       </div>
                  </div>

                  <div className="absolute bottom-0 inset-x-0 h-[60px] bg-white flex items-center justify-around border-t border-gray-100 shrink-0">
                     <Home className="w-6 h-6" fill="currentColor" strokeWidth={0.5} />
                     <Search className="w-6 h-6" />
                     <PlusSquare className="w-6 h-6" />
                     <Heart className="w-6 h-6" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
