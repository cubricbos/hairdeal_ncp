import { Scissors, Instagram, Youtube, Phone, Mail, MapPin, Facebook, Twitter, Clock, X } from 'lucide-react';
import { useSiteContext } from '../context/SiteContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

function PolicyModal({ isOpen, onClose, title, content }: { isOpen: boolean; onClose: () => void; title: string; content: string }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b flex items-center justify-between bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto text-gray-600 leading-relaxed whitespace-pre-wrap text-sm">
              {content}
            </div>
            <div className="p-4 border-t bg-gray-50 text-right">
              <button 
                onClick={onClose}
                className="px-6 py-2 bg-brand-primary text-white font-bold rounded-lg hover:shadow-lg transition-all"
              >
                닫기
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default function Footer() {
  const { settings } = useSiteContext();
  const { footer } = settings;
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | null>(null);

  useEffect(() => {
    const handleOpenPolicy = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail === 'terms' || customEvent.detail === 'privacy') {
        setActiveModal(customEvent.detail);
      }
    };
    window.addEventListener('open-policy', handleOpenPolicy);
    return () => window.removeEventListener('open-policy', handleOpenPolicy);
  }, []);

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return <Instagram className="w-5 h-5" />;
      case 'youtube': return <Youtube className="w-5 h-5" />;
      case 'facebook': return <Facebook className="w-5 h-5" />;
      case 'twitter': return <Twitter className="w-5 h-5" />;
      default: return <Instagram className="w-5 h-5" />;
    }
  };

  return (
    <footer className="bg-gray-950 text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-6">
              {footer.logoType === 'text' ? (
                <span className="text-2xl font-bold font-display tracking-tighter uppercase">
                  {footer.logoText}
                </span>
              ) : footer.logoImage ? (
                <img 
                  src={footer.logoImage || undefined} 
                  alt="Logo" 
                  style={{ 
                    width: footer.logoWidth || 'auto', 
                    height: footer.logoHeight || '32px' 
                  }}
                  className="object-contain brightness-0 invert"
                />
              ) : null}
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 whitespace-pre-wrap">
              {footer.subtitle}
            </p>
            <div className="flex gap-4">
              {footer.social.map((item) => (
                <a 
                  key={item.id}
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 bg-gray-900 rounded-full hover:bg-brand-primary transition-colors"
                >
                  {getSocialIcon(item.platform)}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-lg text-white">회사</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  회사 소개
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  인재 채용
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  블로그
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-lg text-white">회사 소식</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>
                <Link to="/support" className="hover:text-white transition-colors">
                  공지사항
                </Link>
              </li>
              <li>
                <Link to="/support" state={{ tab: 'events' }} className="hover:text-white transition-colors">
                  이벤트
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-lg text-white">문의</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              {footer.contact.showEmail !== false && (
                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-brand-primary shrink-0" />
                  <span>{footer.contact.email}</span>
                </li>
              )}
              {footer.contact.showPhone !== false && (
                <li className="flex flex-col gap-1">
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-brand-primary shrink-0" />
                    <span>{footer.contact.phone}</span>
                  </div>
                  {footer.contact.showWorkingHours !== false && footer.contact.workingHours && (
                    <div className="flex items-center gap-3 pl-8 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{footer.contact.workingHours}</span>
                    </div>
                  )}
                </li>
              )}
              {footer.contact.showAddress !== false && (
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-primary shrink-0" />
                  <span>{footer.contact.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 font-medium">
          <p>{footer.copyright}</p>
          <div className="flex gap-6">
            <button 
              onClick={() => setActiveModal('terms')}
              className="hover:text-white transition-colors"
            >
              서비스 이용약관
            </button>
            <span className="text-gray-800">|</span>
            <button 
              onClick={() => setActiveModal('privacy')}
              className="hover:text-white transition-colors"
            >
              개인정보처리방침
            </button>
          </div>
        </div>
      </div>

      <PolicyModal 
        isOpen={activeModal === 'terms'} 
        onClose={() => setActiveModal(null)} 
        title="서비스 이용약관" 
        content={footer.policies.terms} 
      />
      <PolicyModal 
        isOpen={activeModal === 'privacy'} 
        onClose={() => setActiveModal(null)} 
        title="개인정보처리방침" 
        content={footer.policies.privacy} 
      />
    </footer>
  );
}
