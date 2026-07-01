import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { User } from '@supabase/supabase-js';
import { Copy, CheckCircle2, UserPlus, Image as ImageIcon, Gift, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { accountClient } from '../../lib/ncpClient';

interface ReferralPageProps {
  user: User | null;
}

interface Mission {
  id: string;
  status: string;
  created_at: string;
  referred: {
    id: string;
    email: string;
    full_name: string;
  };
}

export default function ReferralPage({ user }: ReferralPageProps) {
  const [profile, setProfile] = useState<any>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [rewardSettings, setRewardSettings] = useState({ signup: 20, activity: 80 });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true); 

      // Fetch profile for referral code
      let currentProfileData = null;
      try {
        let { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user?.id)
          .maybeSingle();
        
        if (!profileData && user?.email) {
          const { data: emailProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', user?.email)
            .maybeSingle();
          if (emailProfile) {
            profileData = emailProfile;
          }
        }

        currentProfileData = profileData;

      } catch (dbErr) {
        console.warn("Database lookup failed during referral fetch, using local synthetic fallback:", dbErr);
      }
      
        if (!currentProfileData && user) {
          currentProfileData = {
            id: user.id,
            email: user.email || 'user@example.com',
            full_name: user.user_metadata?.full_name || '원장님',
            referral_code: null,
            credits: 0
          };
        }

        // --- FETCH FROM NCP AS A FALLBACK/OVERRIDE ---
        if (localStorage.getItem('ncp_access_token')) {
          try {
            const { data: ncpDetail } = await accountClient.get('/designer/detail');
            if (ncpDetail && (ncpDetail.referralCode || ncpDetail.referral_code)) {
              const liveCode = ncpDetail.referralCode || ncpDetail.referral_code;
              // Override referral code with live NCP value 
              if (currentProfileData) {
                currentProfileData.referral_code = liveCode;
              }
              // Optional: background sync to Supabase if it wasn't there
              if (currentProfileData && currentProfileData.id) {
                supabase.from('profiles').update({ referral_code: liveCode }).eq('id', currentProfileData.id).then();
              }
            }
          } catch (ncpErr) {
            console.warn("NCP Detail fetch failed during Referral fetch", ncpErr);
          }
        }

        setProfile(currentProfileData);

      // Fetch missions
      try {
        const { data: missionsData } = await supabase
          .from('referral_missions')
          .select(`
            id,
            status,
            created_at,
            referred:profiles!referral_missions_referred_id_fkey (
              id,
              email,
              full_name
            )
          `)
          .eq('referrer_id', user?.id)
          .order('created_at', { ascending: false });

        if (missionsData) {
          setMissions(missionsData as any);
        }
      } catch (missErr) {
         console.warn("Could not query referral_missions:", missErr);
      }

      // Fetch reward settings
      try {
        const { data: metrics } = await supabase.from('app_metrics').select('referral_signup_reward, referral_activity_reward').eq('id', 1).maybeSingle();
        if (metrics) {
          setRewardSettings({
            signup: metrics.referral_signup_reward ?? 20,
            activity: metrics.referral_activity_reward ?? 80
          });
        }
      } catch (metErr) {
         console.warn("Could not query app_metrics for referral reward settings:", metErr);
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!profile?.referral_code) return;
    const link = `${window.location.origin}/?ref=${profile.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    if (!profile?.referral_code) return;
    navigator.clipboard.writeText(profile.referral_code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const totalEarned = missions.reduce((total, m) => {
    let earned = 0;
    if (m.status === 'signup' || m.status === 'completed') earned += rewardSettings.signup;
    if (m.status === 'completed') earned += rewardSettings.activity;
    return total + earned;
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 min-h-screen pt-32">
        <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-brand-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">친구 추천</h1>
          <p className="text-gray-500 font-medium tracking-tight">친구를 초대하고 함께 크레딧 혜택을 받아보세요.</p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Dashboard Card */}
        <div className="w-full md:w-1/3 bg-gradient-to-br from-brand-primary to-brand-primary/80 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Gift className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-white/90 mb-1">총 추천 보상</h3>
            <div className="text-4xl font-black mb-4">{totalEarned} <span className="text-xl font-bold">C</span></div>
            <div className="flex flex-col gap-2 text-sm text-white/80">
              <div className="flex justify-between items-center bg-black/10 rounded-lg p-2 px-3">
                <span>가입 성공</span>
                <span className="font-bold text-white">{missions.length}명</span>
              </div>
              <div className="flex justify-between items-center bg-black/10 rounded-lg p-2 px-3">
                <span>미션 완료</span>
                <span className="font-bold text-white">{missions.filter(m => m.status === 'completed').length}명</span>
              </div>
            </div>
          </div>
        </div>

        {/* Link Card */}
        <div className="w-full md:w-2/3 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center min-h-[200px]">
          <h3 className="text-xl font-bold text-gray-900 mb-2">내 추천 코드 및 링크</h3>
          <p className="text-gray-500 text-sm mb-6">친구에게 아래 링크나 코드를 공유하고 보상을 받으세요.</p>
          
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 gap-4">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-sm font-medium text-gray-500">추천코드 :</span>
                <span className="font-mono text-lg font-bold text-brand-primary tracking-wider">{profile?.referral_code || '발급 중...'}</span>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <button
                  onClick={handleCopyCode}
                  className="text-sm font-bold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:border-gray-300 rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1.5 whitespace-nowrap min-w-[80px] justify-center"
                >
                  {codeCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {codeCopied ? '복사됨' : '복사'}
                </button>
                <button
                  onClick={handleCopyLink}
                  className={`text-sm font-bold text-white transition-all flex items-center gap-1.5 whitespace-nowrap min-w-[100px] justify-center rounded-lg px-3 py-1.5 ${
                    copied ? 'bg-green-500' : 'bg-gray-900 hover:bg-black'
                  }`}
                >
                  {copied ? (
                    <><Check className="w-4 h-4" /> 복사됨</>
                  ) : (
                    <><Copy className="w-4 h-4" /> 링크 복사</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">추천 현황</h3>
        </div>
        
        {missions.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium">아직 추천한 친구가 없습니다.</p>
            <p className="text-sm mt-1">링크를 공유하고 혜택을 받아보세요!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {missions.map((mission) => {
              const isCompleted = mission.status === 'completed';
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={mission.id} 
                  className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{mission.referred?.full_name || '사용자'}</span>
                      <span className="text-sm text-gray-500">
                        ({mission.referred?.email ? mission.referred.email.substring(0, 3) : '***'}***)
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 font-medium">
                      가입일: {new Date(mission.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                    {/* Step 1: Signup */}
                    <div className={`flex flex-col items-center flex-1 sm:flex-initial p-3 rounded-xl border ${mission.status ? 'border-brand-primary/20 bg-brand-primary/5' : 'border-gray-100'}`}>
                      <div className="flex items-center gap-1.5 text-sm font-bold text-brand-primary mb-1">
                        <CheckCircle2 className="w-4 h-4" /> 가입 (+{rewardSettings.signup}C)
                      </div>
                    </div>

                    {/* Step 2: Image Generation */}
                    <div className={`flex flex-col items-center flex-1 sm:flex-initial p-3 rounded-xl border ${isCompleted ? 'border-brand-primary/20 bg-brand-primary/5' : 'border-gray-100 bg-gray-50 opacity-50'}`}>
                      <div className={`flex items-center gap-1.5 text-sm font-bold mb-1 ${isCompleted ? 'text-brand-primary' : 'text-gray-500'}`}>
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />} 생성 (+{rewardSettings.activity}C)
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
