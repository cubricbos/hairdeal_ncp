import React, { useState } from 'react';
import { useSiteContext } from '../context/SiteContext';
import { AlertTriangle, Hammer, Lock } from 'lucide-react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';

export default function ParkingPage() {
  const { settings } = useSiteContext();
  const pp = settings?.parkingPage;
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  const handleLoginSuccess = () => {
    window.location.href = '/';
  };

  if (!pp?.enabled) return null;

  // Simple brightness calculation to determine text color
  const getBrightness = (hex: string) => {
    if (!hex) return 0;
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return ((r * 299) + (g * 587) + (b * 114)) / 1000;
  };

  const isDark = getBrightness(pp.bgColor || '#111827') < 128;
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const subtextColor = isDark ? 'text-white/70' : 'text-gray-600';
  const iconBgColor = isDark ? 'bg-white/10 border-white/20' : 'bg-gray-100 border-gray-200';
  const lockColor = isDark ? 'text-white/30 hover:text-white/60' : 'text-gray-400 hover:text-gray-900';

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 relative"
      style={{ backgroundColor: pp.bgColor || '#111827' }}
    >
      <button 
        className={`absolute top-8 right-8 transition-colors ${lockColor}`}
        onClick={() => setIsAdminLoginOpen(true)}
      >
        <Lock className="w-5 h-5" />
      </button>

      <div className="text-center max-w-2xl mx-auto z-10">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm border ${iconBgColor}`}>
          {pp.type === 'coming-soon' ? (
            <Hammer className={`w-10 h-10 ${textColor}`} />
          ) : (
            <AlertTriangle className={`w-10 h-10 ${textColor}`} />
          )}
        </div>
        
        <h1 className={`text-4xl md:text-5xl font-black mb-6 whitespace-pre-line tracking-tight ${textColor}`}>
          {pp.title || '시스템 점검 중입니다'}
        </h1>
        
        {pp.subtitle && (
          <p 
            className={`text-lg md:text-xl leading-relaxed font-medium ${subtextColor}`}
            dangerouslySetInnerHTML={{ __html: pp.subtitle.replace(/\\n/g, '<br/>') }}
          />
        )}
      </div>
      
      <AuthModal isOpen={isAdminLoginOpen} onClose={() => setIsAdminLoginOpen(false)} onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}
