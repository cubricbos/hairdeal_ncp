import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Shield, Camera, Lock, Trash2 } from 'lucide-react';
import { supabase } from '../../supabase';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState<{ id: string; email: string; full_name: string; marketing_consent?: boolean } | null>(null);
  
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/');
        return;
      }
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (data) {
        setProfile(data);
        setFullName(data.full_name || session.user.user_metadata?.full_name || '');
        setMarketingConsent(!!data.marketing_consent);
      } else {
        setProfile({
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || '',
          marketing_consent: false
        });
        setFullName(session.user.user_metadata?.full_name || '');
        setMarketingConsent(false);
      }
      setLoading(false);
    };
    
    fetchProfile();
  }, [navigate]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    
    try {
      // Update full name and marketing consent
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName,
          marketing_consent: marketingConsent
        })
        .eq('id', profile.id);
        
      if (profileError) throw profileError;
      
      // Update Auth User metadata
      await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      // Update password if provided
      if (password) {
        if (password !== confirmPassword) {
          alert('비밀번호가 일치하지 않습니다.');
          setSaving(false);
          return;
        }
        
        const { error: pwError } = await supabase.auth.updateUser({
          password: password
        });
        
        if (pwError) throw pwError;
        alert('프로필 및 비밀번호가 성공적으로 업데이트되었습니다.');
        setPassword('');
        setConfirmPassword('');
      } else {
        alert('프로필이 성공적으로 업데이트되었습니다.');
      }
      
    } catch (err: any) {
      alert('오류가 발생했습니다: ' + err.message);
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
      const { error } = await supabase.rpc('delete_user_account', {
        target_user_id: profile.id
      });
      
      if (error) {
        if (error.message.includes('function delete_user_account')) {
          throw new Error('데이터베이스에 계정 삭제 기능이 설정되지 않았습니다. 관리자에게 설정 스크립트 실행을 요청하세요. (database_setup_account_management.sql)');
        }
        throw error;
      }
      
      await supabase.auth.signOut();
      navigate('/');
      alert('회원 탈퇴가 완료되었습니다. 데이터가 모두 초기화되었습니다.');
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
              <User className="w-16 h-16 text-brand-primary" />
            </div>
            <button className="absolute bottom-0 right-0 bg-white p-2.5 rounded-full shadow-md border border-gray-100 text-brand-primary hover:scale-110 transition-transform">
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
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
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
                  value={profile.email}
                  className="w-full pl-12 pr-4 py-4 bg-gray-100 rounded-2xl border-none font-bold text-gray-500 cursor-not-allowed"
                />
              </div>
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
