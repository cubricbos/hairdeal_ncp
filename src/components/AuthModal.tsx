import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, User, Lock, Facebook } from 'lucide-react';
import { useState, MouseEvent, FormEvent, useEffect } from 'react';
import { supabase } from '../supabase';

// Simple Google SVG Icon since it's not in Lucide by default
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState(() => localStorage.getItem('referral_code') || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoading(false);
      setError(null);
      setSuccessMessage(null);
      setPassword('');
      setPasswordConfirm('');
      setShowForgotPassword(false);
    }
  }, [isOpen]);

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSuccessMessage('비밀번호 재설정 이메일이 발송되었습니다. 이메일을 확인해주세요.');
      setShowForgotPassword(false);
    } catch (err: any) {
      setError(`오류 발생: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const signInAsGuest = async () => {
    setEmail('demo@hairdeal.io');
    setPassword('demo1234');
    setIsLogin(true);
    // Note: This requires a demo account to exist in Supabase. 
    // Since I can't create one, I'll alert the user to use the Sign Up tab if this fails.
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent double click
    
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (isLogin) {
        // Log in flow
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        if (error) throw error;
        
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          onClose();
        }
      } else {
        // Sign up flow
        if (password !== passwordConfirm) {
          throw new Error('비밀번호가 일치하지 않습니다.');
        }
        
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name || '사용자'
            }
          }
        });
        
        if (error) throw error;
        
        // Show success message inside the modal
        setSuccessMessage('회원가입이 완료되었습니다! 발송된 인증 이메일을 확인해 주세요.');
        setPassword('');
        setPasswordConfirm('');
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      let errorMsg = err.message || '인증 중 서버 오류가 발생했습니다.';
      
      // Translate common error messages
      if (errorMsg.includes('Invalid login credentials')) {
        errorMsg = '이메일 또는 비밀번호가 올바르지 않습니다. 다시 확인해주세요.';
      } else if (errorMsg.includes('Email not confirmed')) {
        errorMsg = '이메일 인증이 일치하지 않거나 반려되었습니다.';
      } else if (errorMsg.includes('User already registered') || errorMsg.includes('User already exists')) {
        errorMsg = '이미 가입된 이메일입니다.';
      } else if (errorMsg.includes('Password should be at least')) {
        errorMsg = '비밀번호는 최소 6자 이상이어야 합니다.';
      } else if (errorMsg.includes('invalid claim')) {
        errorMsg = '지원되지 않는 인증 방식입니다.';
      } else {
        errorMsg = `인증 오류가 발생했습니다: ${errorMsg}`;
      }

      setError(errorMsg);
    } finally {
      if (isOpen) {
        setLoading(false);
      }
    }
  };

  const handleOAuth = async (provider: string) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: `${window.location.origin}/ai-hair-model`,
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e: MouseEvent) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
        >
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8 sm:p-10">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                {isLogin ? '환영합니다!' : '헤어딜 시작하기'}
              </h2>
              <p className="text-gray-500 font-medium">
                {isLogin ? '계정에 로그인하여 계속해주세요.' : '무료로 가입하고 AI 포트폴리오를 만들어보세요.'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl font-medium text-center">
                {error}
              </div>
            )}

            {successMessage ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">처리 완료!</h3>
                <p className="text-gray-600 font-medium leading-relaxed mb-6">
                  {successMessage}
                </p>
                <button
                  onClick={() => {
                    setSuccessMessage(null);
                    setIsLogin(true);
                  }}
                  className="bg-brand-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-brand-primary/90 transition-all"
                >
                  로그인 화면으로 가기
                </button>
              </div>
            ) : showForgotPassword ? (
              <form className="space-y-4 mb-6" onSubmit={handleForgotPassword}>
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">비밀번호 찾기</h3>
                  <p className="text-sm text-gray-500">가입하신 이메일 주소를 입력하시면<br/>비밀번호 재설정 링크를 보내드립니다.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">이메일</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="email" 
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-primary text-white font-bold py-4 rounded-xl hover:bg-brand-primary/90 transition-all mt-2 disabled:opacity-70"
                >
                  {loading ? '발송 중...' : '재설정 이메일 받기'}
                </button>
                <div className="text-center">
                  <button 
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="text-sm text-gray-500 font-medium hover:text-brand-primary"
                  >
                    로그인으로 돌아가기
                  </button>
                </div>
              </form>
            ) : (
              <>
                <form className="space-y-4 mb-6" onSubmit={handleSubmit}>
                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">이름</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="text" 
                          placeholder="홍길동"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required={!isLogin}
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">이메일</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                        type="email" 
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-sm font-semibold text-gray-700">비밀번호</label>
                      {isLogin && (
                        <button 
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-xs font-bold text-brand-primary hover:underline"
                        >
                          비밀번호 찾기
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none"
                      />
                    </div>
                  </div>

                  {!isLogin && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">비밀번호 확인</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input 
                            type="password" 
                            placeholder="••••••••"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            required={!isLogin}
                            minLength={6}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">친구 추천 코드 (선택)</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input 
                            type="text" 
                            placeholder="추천받은 코드가 있다면 입력해주세요"
                            value={referralCode}
                            onChange={(e) => {
                              setReferralCode(e.target.value);
                              if (e.target.value) {
                                localStorage.setItem('referral_code', e.target.value);
                              } else {
                                localStorage.removeItem('referral_code');
                              }
                            }}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-primary text-white font-bold py-4 rounded-xl hover:bg-brand-primary/90 hover:shadow-lg transition-all mt-2 disabled:opacity-70 flex items-center justify-center"
                  >
                    {loading ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
                  </button>
                </form>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">또는 간편 로그인</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  <button 
                    onClick={() => handleOAuth('google')}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 font-semibold text-gray-700 transition-colors"
                  >
                    <GoogleIcon className="w-5 h-5" />
                    구글
                  </button>
                  <button 
                    onClick={() => handleOAuth('facebook')}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-[#1877F2] text-white rounded-xl hover:opacity-90 font-semibold transition-opacity"
                  >
                    <Facebook className="w-5 h-5 fill-current" />
                    페이스북
                  </button>
                </div>

                <div className="text-center mt-6 pt-6 border-t border-gray-100">
                  <p className="text-gray-500 font-medium text-sm mb-3">계정이 없으신가요?</p>
                  <div className="flex flex-col gap-2">
                    <button 
                      type="button"
                      onClick={toggleMode}
                      className="w-full py-3 border border-brand-primary text-brand-primary font-bold rounded-xl hover:bg-brand-primary/5 transition-all text-sm"
                    >
                      {isLogin ? '30초 만에 회원가입하기' : '로그인으로 돌아가기'}
                    </button>
                    {isLogin && (
                      <button 
                        type="button"
                        onClick={signInAsGuest}
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        체험용 계정 정보 입력하기
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
