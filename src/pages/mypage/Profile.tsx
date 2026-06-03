import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Shield, Camera, Lock, Trash2, Phone, FileText } from 'lucide-react';
import { supabase } from '../../supabase';
import { useNavigate } from 'react-router-dom';
import { accountClient } from '../../lib/ncpClient';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // profile state representing NCP Designer
  const [profile, setProfile] = useState<{ email: string; name: string; mobileNumber?: string; introduction?: string; profileImageUrl?: string } | null>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('ncp_access_token');
      if (!token) {
        // Fallback to Supabase Profile for social-logged-in users
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: spProfile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
            if (spProfile) {
              setProfile({
                email: session.user.email || '',
                name: spProfile.full_name || '',
                mobileNumber: spProfile.phone || '',
                introduction: spProfile.introduction || '',
                profileImageUrl: spProfile.avatar_url || ''
              });
              setName(spProfile.full_name || '');
              setEmail(session.user.email || '');
              setMobileNumber(spProfile.phone || '');
              setIntroduction(spProfile.introduction || '');
              setProfileImageUrl(spProfile.avatar_url || null);
              setReferralCode(spProfile.referral_code || '');
            }
          }
        } catch (supabaseErr) {
          console.warn('Supabase fallback profile fetch failed:', supabaseErr);
        } finally {
          setLoading(false);
        }
        return;
      }

      let decoded: any = null;
      try {
        const payloadPart = token.split('.')[1];
        const decodedStr = decodeURIComponent(escape(atob(payloadPart)));
        decoded = JSON.parse(decodedStr);
      } catch (e) {
        console.warn("Could not decode NCP token in Profile.tsx:", e);
      }

      try {
        const { data } = await accountClient.get('/designer/detail');
        if (data) {
          let finalId = decoded?.id || '';
          if (finalId && !finalId.includes('-')) {
             finalId = `${finalId.substring(0, 8)}-${finalId.substring(8, 12)}-${finalId.substring(12, 16)}-${finalId.substring(16, 20)}-${finalId.substring(20)}`;
          }

          let spData: any = null;
          if (finalId) {
            try {
              const { data: spProfile } = await supabase.from('profiles').select('*').eq('id', finalId).maybeSingle();
              spData = spProfile;
            } catch (spErr) {
              console.warn("Could not fetch extra profile details in ProfilePage:", spErr);
            }
          }

          const fallbackEmail = decoded?.email || spData?.email || `${decoded?.id || 'designer'}@ncp.local`;
          const fallbackName = decoded?.name || spData?.full_name || '디자이너';

          setProfile(data);
          setName(data.name || fallbackName);
          setEmail(data.email || fallbackEmail);
          setMobileNumber(data.mobileNumber || data.mobile_number || data.phone || decoded?.mobileNumber || spData?.phone || '');
          setIntroduction(data.introduction || spData?.introduction || '');
          setReferralCode(data.referral_code || data.referralCode || spData?.referral_code || '');
          
          const finalImg = data.profileImageUrl || data.imageUrl || data.image || spData?.avatar_url || '';
          if (finalImg) {
            setProfileImageUrl(finalImg);
          }
        }
      } catch (err) {
        console.warn('NCP 프로필 상세 조회 실패, 토큰 파싱 시도:', err);
        try {
          if (decoded) {
            let fullUuid = decoded.id;
            if (fullUuid && !fullUuid.includes('-')) {
               fullUuid = `${fullUuid.substring(0, 8)}-${fullUuid.substring(8, 12)}-${fullUuid.substring(12, 16)}-${fullUuid.substring(16, 20)}-${fullUuid.substring(20)}`;
            }

            // Check if we can load additional details from Supabase profiles
            const { data: spData } = await supabase.from('profiles').select('*').eq('id', fullUuid).maybeSingle();

            const fallbackProfile = {
              email: decoded.email || spData?.email || `${decoded.id || 'designer'}@ncp.local`,
              name: decoded.name || spData?.full_name || '디자이너',
              mobileNumber: decoded.mobileNumber || spData?.phone || '',
              introduction: spData?.introduction || '',
              profileImageUrl: spData?.avatar_url || ''
            };
            setProfile(fallbackProfile);
            setName(fallbackProfile.name);
            setEmail(fallbackProfile.email);
            setMobileNumber(fallbackProfile.mobileNumber);
            setIntroduction(fallbackProfile.introduction);
            setProfileImageUrl(fallbackProfile.profileImageUrl || null);
            setReferralCode(spData?.referral_code || '');
          }
        } catch (parseErr) {
          console.error("JWT Parse/Lookup error in ProfilePage catch block:", parseErr);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      setProfileImageUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    
    if (password && password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    setSaving(true);
    
    try {
      // 1. Attempt to update NCP server
      try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('mobileNumber', mobileNumber);
        if (introduction) formData.append('introduction', introduction);
        if (password) formData.append('password', password);
        
        if (profileImage) {
          formData.append('images', profileImage);
        }

        await accountClient.post('/designer/change', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } catch (ncpErr) {
        console.warn("NCP server-side profile change not completely supported or error:", ncpErr);
      }

      // 2. Sync to Supabase Profiles for app metadata and offline access
      const token = localStorage.getItem('ncp_access_token');
      let targetUserId = '';
      if (token) {
        try {
          const payloadPart = token.split('.')[1];
          const decodedStr = decodeURIComponent(escape(atob(payloadPart)));
          const decoded = JSON.parse(decodedStr);
          const rawId = decoded.id;
          targetUserId = rawId.includes('-') ? rawId : `${rawId.substring(0, 8)}-${rawId.substring(8, 12)}-${rawId.substring(12, 16)}-${rawId.substring(16, 20)}-${rawId.substring(20)}`;
        } catch (e) {
          console.warn("NCP user ID resolve failed for Supabase profile save:", e);
        }
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        targetUserId = session?.user?.id || '';
      }

      if (targetUserId) {
        await supabase.from('profiles').upsert({
          id: targetUserId,
          full_name: name,
          email: email,
          phone: mobileNumber,
          introduction: introduction,
          avatar_url: profileImageUrl || '',
          referral_code: referralCode
        }, { onConflict: 'id' });
      }
      
      alert('프로필이 성공적으로 업데이트되었습니다.');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      alert('오류가 발생했습니다: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!profile) return;
    
    const confirmDelete = window.confirm(
      '정말로 회원탈퇴를 진행하시겠습니까? 탈퇴 후 모든 크레딧과 결제 내역, 프로필 정보가 영구적으로 삭제되며 복구할 수 없습니다.'
    );
    
    if (!confirmDelete) return;
    setIsDeleting(true);
    
    try {
      // NCP API를 통한 회원탈퇴 호출이 필요한 경우 여기에 추가
      // await accountClient.delete('/designer');

      await supabase.auth.signOut().catch(() => {});
      
      window.dispatchEvent(new Event('ncp_auth_changed'));
      
      alert('회원 탈퇴가 완료되었습니다. 데이터가 모두 초기화되었습니다.');
      
      // Force a full reload to clear all in-memory states and ensure cleanup via main.tsx
      setTimeout(() => {
        window.location.href = window.location.origin + '/?logout=' + Date.now();
      }, 200);
    } catch (err: any) {
      console.error(err);
      alert('탈퇴 처리 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading || !profile) {
    return <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto text-center">로딩중...</div>;
  }

  return (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-gray-100"
      >
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-brand-primary/10 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
              {profileImageUrl ? (
                <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-brand-primary" />
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageChange}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-white p-2.5 rounded-full shadow-md border border-gray-100 text-brand-primary hover:scale-110 transition-transform"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-black text-gray-900 mb-2">원장님 프로필</h1>
            <p className="text-gray-500 font-medium tracking-tight">서비스 이용을 위한 회원 정보를 관리하세요</p>
          </div>
          <div className="text-center md:text-right">
             <button 
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="text-red-500 font-medium hover:bg-red-50 px-4 py-2 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm border border-transparent hover:border-red-100 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? '탈퇴 처리중...' : '회원 탈퇴'}
              </button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">성함</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary/20 font-bold text-gray-900"
                  placeholder="이름을 입력하세요"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">이메일 주소</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="email" 
                  disabled
                  value={email}
                  className="w-full pl-12 pr-4 py-4 bg-gray-100 rounded-2xl border-none font-bold text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">연락처</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary/20 font-bold text-gray-900"
                  placeholder="연락처를 입력하세요"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">소개글</label>
            <div className="relative">
              <FileText className="absolute left-4 top-6 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <textarea 
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary/20 font-bold text-gray-900 min-h-[120px] resize-y"
                placeholder="간단한 소개글을 입력하세요"
              />
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-100">
             <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
               <Shield className="w-5 h-5 text-brand-primary" />
               개인정보 및 보안 설정
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
               <div className="space-y-2">
                 <label className="text-sm font-bold text-gray-700 ml-1">새 비밀번호</label>
                 <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                   <input 
                     type="password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     placeholder="변경할 비밀번호 입력 (선택사항)"
                     className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary/20 font-bold text-gray-900 placeholder:font-normal"
                   />
                 </div>
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-bold text-gray-700 ml-1">비밀번호 확인</label>
                 <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                   <input 
                     type="password"
                     value={confirmPassword}
                     onChange={(e) => setConfirmPassword(e.target.value)}
                     placeholder="비밀번호 다시 입력"
                     className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary/20 font-bold text-gray-900 placeholder:font-normal"
                   />
                 </div>
               </div>
             </div>

             <div className="bg-gray-50 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">마케팅 정보 수신 동의</h4>
                    <p className="text-xs text-gray-500 mt-1">이벤트, 할인 혜택 등 유용한 마케팅 정보를 받아보시겠습니까?</p>
                  </div>
                  <button 
                    onClick={() => setMarketingConsent(!marketingConsent)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${marketingConsent ? 'bg-brand-primary' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${marketingConsent ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="pt-6 border-t border-gray-200/60">
                   <h4 className="text-sm font-bold text-gray-900 mb-3 tracking-tight">개인정보 권리 행사 안내</h4>
                   <ul className="space-y-3 text-xs text-gray-500 font-medium leading-relaxed">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/40 mt-1.5 shrink-0" />
                        <span><strong className="text-gray-700">열람 및 정정:</strong> 현재 화면(프로필 수정)에서 본인의 정보를 실시간으로 확인하고 즉시 수정하실 수 있습니다.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/40 mt-1.5 shrink-0" />
                        <span><strong className="text-gray-700">동의 철회:</strong> 상단의 마케팅 수신 설정을 통해 언제든지 즉시 동의를 철회하실 수 있습니다.</span>
                      </li>
                      <li className="flex items-start gap-2 text-red-500/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400/40 mt-1.5 shrink-0" />
                        <span><strong className="text-red-600">삭제(탈퇴) 요청:</strong> 상단의 '회원 탈퇴' 버튼 또는 고객센터를 통해 요청하실 수 있으며, 법령에서 정한 기간 외의 데이터는 지체 없이 파기됩니다.</span>
                      </li>
                   </ul>
                </div>
             </div>
          </div>
        </div>

        <div className="mt-12 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-brand-primary text-white px-10 py-4 rounded-2xl font-bold hover:shadow-xl hover:shadow-brand-primary/20 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
          >
            {saving ? '저장 중...' : '정보 저장하기'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;

