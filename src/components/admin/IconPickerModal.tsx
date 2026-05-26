import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import * as Icons from 'lucide-react';

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: 'lucide' | 'emoji' | 'image', value: string) => void;
  initialType?: 'lucide' | 'emoji' | 'image';
  initialValue?: string;
}

const BASIC_ICONS = [
  'Star', 'Heart', 'Shield', 'Zap', 'Activity', 'TrendingUp', 'Award', 'CheckCircle2',
  'PieChart', 'BarChart3', 'TrendingDown', 'Users', 'User', 'UserPlus', 'UserCheck', 'Briefcase',
  'Calendar', 'CalendarCheck', 'Clock', 'History', 'Timer', 'Globe', 'Map', 'MapPin',
  'Navigation', 'Compass', 'MessageCircle', 'MessageSquare', 'Mail', 'Phone', 'Video', 'Camera',
  'Image', 'Music', 'Bell', 'Search', 'Settings', 'Sliders', 'Filter', 'List', 'Grid',
  'Check', 'Plus', 'Minus', 'X', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'ChevronRight',
  'ChevronLeft', 'ChevronUp', 'ChevronDown', 'Maximize', 'Minimize', 'Download', 'Upload', 'Cloud',
  'Database', 'Server', 'HardDrive', 'Cpu', 'Monitor', 'Laptop', 'Smartphone', 'Tablet',
  'Lock', 'Unlock', 'Key', 'CreditCard', 'ShoppingCart', 'ShoppingBag', 'Tag', 'Gift', 'Box',
  'Smile', 'Frown', 'Meh', 'ThumbsUp', 'ThumbsDown', 'Eye', 'EyeOff', 'Edit', 'Edit2', 'Edit3',
  'Copy', 'Clipboard', 'File', 'FileText', 'Folder', 'Trash', 'Trash2', 'Paperclip', 'Link'
];

const MOBILE_ICONS = [
  'Smartphone', 'Tablet', 'Monitor', 'Watch', 'Battery', 'BatteryCharging', 'BatteryFull', 'BatteryLow',
  'BatteryMedium', 'Wifi', 'WifiOff', 'Signal', 'Bluetooth', 'BluetoothConnected', 'BluetoothOff',
  'MoreHorizontal', 'MoreVertical', 'Menu', 'Grid', 'List', 'Share', 'Share2', 'Camera', 'Radio',
  'Mic', 'MicOff', 'Volume', 'Volume1', 'Volume2', 'VolumeX', 'Phone', 'PhoneCall', 'PhoneForwarded',
  'PhoneMissed', 'PhoneOff', 'MessageCircle', 'MessageSquare', 'Video', 'VideoOff', 'Play', 'Pause',
  'Square', 'Circle', 'Triangle', 'Power', 'RefreshCw', 'RefreshCcw', 'RotateCcw', 'RotateCw',
  'Fingerprint', 'Scan', 'ScanFace', 'ScanLine', 'Home', 'Search', 'Settings', 'User', 'Bell',
  'Calendar', 'Clock', 'MapPin', 'Navigation', 'Compass', 'Mail', 'Inbox', 'Send', 'Archive'
];

const EMOJIS = [
  '😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚',
  '😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣',
  '😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗',
  '🤔','🤭','🤫','🤥','😶','😐','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵','🤐',
  '🥴','🤢','🤮','🤧','😷','🤒','🤕','🤑','🤠','😈','👿','👹','👺','🤡','💩','👻','💀','☠️','👽','👾',
  '🤖','🎃','😺','😸','😹','😻','😼','😽','🙀','😿','😾', '✨', '🌟', '💫', '🔥', '💥', '💯', '💦', '💨',
  '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛳', '⛴', '🚢', '⚓', '⛽', '🚧', '🚦', '🚥', '🛑', '🎡', '🎢', '🎠',
  '💡', '🔦', '🏮', '📔', '📕', '📖', '📗', '📘', '📙', '📚', '📓', '📒', '📃', '📜', '📄', '📰', '🗞', '📑', '🔖',
  '💰', '💴', '💵', '💶', '💷', '💸', '💳', '🧾', '💹', '💎', '⚖️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡', '⚔️', '🛡',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'
];

export default function IconPickerModal({ isOpen, onClose, onSelect, initialType = 'lucide', initialValue = 'Star' }: IconPickerModalProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'mobile' | 'emoji' | 'image'>(
    initialType === 'lucide' ? (MOBILE_ICONS.includes(initialValue) && !BASIC_ICONS.includes(initialValue) ? 'mobile' : 'basic') : initialType === 'emoji' ? 'emoji' : 'image'
  );
  const [imageUrl, setImageUrl] = useState(initialType === 'image' ? initialValue : '');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-[200] flex justify-center items-center p-4">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 0.95 }}
           className="bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[85vh] overflow-hidden"
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">아이콘 선택</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar">
            {[
              { id: 'basic', label: '기본 UI' },
              { id: 'mobile', label: '아이폰/안드로이드 UI' },
              { id: 'emoji', label: '이모지' },
              { id: 'image', label: '이미지 업로드' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-900 bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
            {activeTab === 'basic' && (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {BASIC_ICONS.map(iconName => {
                  const Icon = (Icons as any)[iconName];
                  if (!Icon) return null;
                  return (
                    <button
                      key={iconName}
                      onClick={() => { onSelect('lucide', iconName); onClose(); }}
                      className="aspect-square flex flex-col items-center justify-center gap-2 p-2 bg-white rounded-xl border border-gray-100 hover:border-brand-primary hover:text-brand-primary hover:shadow-md transition-all group"
                    >
                      <Icon className="w-7 h-7 text-gray-600 group-hover:text-brand-primary transition-colors" />
                      <span className="text-[10px] text-gray-400 truncate w-full text-center">{iconName}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {activeTab === 'mobile' && (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {MOBILE_ICONS.map(iconName => {
                  const Icon = (Icons as any)[iconName];
                  if (!Icon) return null;
                  return (
                    <button
                      key={iconName}
                      onClick={() => { onSelect('lucide', iconName); onClose(); }}
                      className="aspect-square flex flex-col items-center justify-center gap-2 p-2 bg-white rounded-xl border border-gray-100 hover:border-brand-primary hover:text-brand-primary hover:shadow-md transition-all group"
                    >
                      <Icon className="w-7 h-7 text-gray-600 group-hover:text-brand-primary transition-colors" />
                      <span className="text-[10px] text-gray-400 truncate w-full text-center">{iconName}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {activeTab === 'emoji' && (
               <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3">
                 {EMOJIS.map((emoji, idx) => (
                   <button
                     key={idx}
                     onClick={() => { onSelect('emoji', emoji); onClose(); }}
                     className="aspect-square flex items-center justify-center text-3xl bg-white rounded-xl border border-gray-100 hover:border-brand-primary hover:shadow-md transition-all transform hover:scale-110"
                   >
                     {emoji}
                   </button>
                 ))}
               </div>
            )}

            {activeTab === 'image' && (
              <div className="max-w-xl mx-auto space-y-6 pt-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                  <h3 className="font-bold border-b pb-2">이미지 URL 직접 입력</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      className="w-full border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-brand-primary"
                      placeholder="https://example.com/icon.png"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                    
                    {imageUrl && (
                       <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-center min-h-32 border border-dashed border-gray-200">
                          <img src={imageUrl} alt="preview" className="max-w-full max-h-32 object-contain" onError={(e) => {
                             (e.target as HTMLImageElement).style.display = 'none';
                          }} onLoad={(e) => {
                             (e.target as HTMLImageElement).style.display = 'block';
                          }} />
                       </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => {
                       if (imageUrl) {
                          onSelect('image', imageUrl);
                          onClose();
                       }
                    }}
                    className={`w-full py-3 rounded-xl font-bold transition-colors ${imageUrl ? 'bg-brand-primary text-white hover:bg-brand-secondary' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    disabled={!imageUrl}
                  >
                    적용하기
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
