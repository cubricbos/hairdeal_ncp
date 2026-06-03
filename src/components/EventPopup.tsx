import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useSiteContext } from '../context/SiteContext';
import { useNavigate } from 'react-router-dom';

export default function EventPopup() {
  const { settings } = useSiteContext();
  const popups = settings.popups || [];

  return (
    <>
      {popups.map(popup => (
        <SinglePopup key={popup.id} popup={popup} />
      ))}
    </>
  );
}

function SinglePopup({ popup }: { popup: any, key?: any }) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!popup || !popup.enabled) return;

    // Check dates
    const now = new Date();
    if (popup.startDate && new Date(popup.startDate) > now) return;
    if (popup.endDate && new Date(popup.endDate) < now) return;

    // Check if dismissed today
    const dismissedAt = localStorage.getItem(`eventPopupDismissedAt_${popup.id}`);
    if (dismissedAt) {
      const dismissedDate = new Date(dismissedAt);
      if (dismissedDate.toDateString() === now.toDateString()) {
        return; // Already dismissed today
      }
    }

    // Small delay for better UX
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, [popup]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleCloseToday = () => {
    localStorage.setItem(`eventPopupDismissedAt_${popup.id}`, new Date().toISOString());
    setIsVisible(false);
  };

  const handleClick = () => {
    if (popup?.linkUrl) {
      if (popup.linkUrl.startsWith('http')) {
        window.open(popup.linkUrl, '_blank');
      } else {
        navigate(popup.linkUrl);
        handleClose();
      }
    }
  };

  if (!popup) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <div 
          className="fixed z-[9999] pointer-events-auto"
          style={{ 
            left: `${popup.positionX ?? 50}%`, 
            top: `${popup.positionY ?? 50}%`, 
            transform: 'translate(-50%, -50%)',
            maxWidth: '90vw',
            width: '400px'
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden relative border border-gray-100"
          >
            {popup.imageUrl && (
              <div 
                className={`w-full ${popup.linkUrl ? 'cursor-pointer' : ''}`}
                onClick={popup.linkUrl ? handleClick : undefined}
              >
                <img src={popup.imageUrl} alt={popup.title} className="w-full h-auto object-cover max-h-80" />
              </div>
            )}
            
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{popup.title}</h3>
              {popup.contentHtml && (
                <div 
                  className="text-gray-600 mb-6 prose prose-sm max-w-none leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: popup.contentHtml.replace(/\n/g, '<br/>') }}
                />
              )}
              
              {popup.linkUrl && popup.linkText && (
                <button
                  onClick={handleClick}
                  className="w-full py-3 px-4 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-colors mb-4"
                >
                  {popup.linkText}
                </button>
              )}
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={handleCloseToday}
                  className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                  오늘 하루 보지 않기
                </button>
                <button
                  onClick={handleClose}
                  className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1"
                >
                  닫기
                </button>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
