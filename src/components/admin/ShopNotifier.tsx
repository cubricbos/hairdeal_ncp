import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { User } from '@supabase/supabase-js';
import { Coffee, MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ShopNotifier({ user }: { user: User }) {
  const [shop, setShop] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    async function loadShop() {
      const { data } = await supabase.from('shops').select('id, name').eq('user_id', user.id).maybeSingle();
      if (data) setShop(data);
    }
    loadShop();
  }, [user]);

  useEffect(() => {
    if (!shop) return;

    // Supabase Realtime Subscription
    const channel = supabase
      .channel(`shop_req_${shop.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'customer_requests', filter: `shop_id=eq.${shop.id}` },
        (payload) => {
          const newReq = payload.new;
          playNotificationSound();
          addNotification(newReq);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shop]);

  const addNotification = (req: any) => {
    const id = Date.now().toString() + Math.random();
    setNotifications(prev => [...prev, { ...req, _nid: id }]);
    
    // Auto remove after 15 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n._nid !== id));
    }, 15000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n._nid !== id));
  };

  const playNotificationSound = () => {
    try {
      const soundId = localStorage.getItem('admin_noti_sound') || '1';
      if (soundId === 'none') return;

      let soundUrl = '';
      if (soundId === 'custom') {
        soundUrl = localStorage.getItem('admin_noti_sound_custom_url') || '';
      } else {
        const defaultSounds: Record<string, string> = {
          '1': 'https://cdn.freesound.org/previews/320/320181_527080-lq.mp3',
          '2': 'https://cdn.freesound.org/previews/415/415059_681014-lq.mp3',
          '3': 'https://cdn.freesound.org/previews/511/511484_5121236-lq.mp3'
        };
        soundUrl = defaultSounds[soundId] || defaultSounds['1'];
      }

      if (soundUrl) {
        const audio = new Audio(soundUrl);
        audio.play().catch(e => console.warn("Failed to play sound:", e));
      }
    } catch (e) {
      console.warn("Audio play failed", e);
    }
  };

  if (!shop || notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 w-80">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif._nid}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden flex items-stretch cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => removeNotification(notif._nid)}
          >
            <div className={`w-2 ${notif.request_type === 'drink' ? 'bg-brand-primary' : 'bg-blue-500'}`} />
            <div className="p-4 flex-1 flex items-start gap-4">
              <div className={`p-2 rounded-full ${notif.request_type === 'drink' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-blue-50 text-blue-500'}`}>
                {notif.request_type === 'drink' ? <Coffee className="w-5 h-5"/> : <MessageCircle className="w-5 h-5"/>}
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 mb-0.5">테이블 {notif.table_number}석</div>
                <div className="text-sm font-bold text-gray-900 leading-tight">
                  {notif.request_type === 'drink' ? (
                    <>
                      {notif.details?.drink_name || '음료'} <span className="text-brand-primary">주문요청</span>
                    </>
                  ) : (
                    <>디자이너 <span className="text-blue-500">상담요청</span></>
                  )}
                </div>
              </div>
            </div>
            <button 
              className="px-3 text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              onClick={(e) => { e.stopPropagation(); removeNotification(notif._nid); }}
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
