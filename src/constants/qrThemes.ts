export interface QRTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  bg: string;
  cardBg: string;
  text: string;
  subText: string;
  border: string;
  thumbnail: string;
  isDark?: boolean;
}

export const QR_THEMES: QRTheme[] = [
  {
    id: 'purple',
    name: '에어리 퍼플',
    primary: '#6d28d9',
    secondary: '#8b5cf6',
    bg: '#f8f7ff',
    cardBg: '#ffffff',
    text: '#1e1b4b',
    subText: '#6366f1',
    border: '#e0e7ff',
    thumbnail: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=400&q=80'
  },
  {
    id: 'orange',
    name: '선셋 오렌지',
    primary: '#f43f5e',
    secondary: '#fb7185',
    bg: '#fff1f2',
    cardBg: '#ffffff',
    text: '#881337',
    subText: '#f43f5e',
    border: '#ffe4e6',
    thumbnail: 'https://images.unsplash.com/photo-1614850523598-811484ff2739?w=400&q=80'
  },
  {
    id: 'brown',
    name: '모던 브라운',
    primary: '#8d7767',
    secondary: '#a69080',
    bg: '#fdfaf9',
    cardBg: '#ffffff',
    text: '#2d241e',
    subText: '#8d7767',
    border: '#f5ebe0',
    thumbnail: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=400&q=80'
  },
  {
    id: 'blue',
    name: '스카이 블루',
    primary: '#0ea5e9',
    secondary: '#38bdf8',
    bg: '#f0f9ff',
    cardBg: '#ffffff',
    text: '#075985',
    subText: '#0ea5e9',
    border: '#e0f2fe',
    thumbnail: 'https://images.unsplash.com/photo-1614850523544-307f59d57dcc?w=400&q=80'
  },
  {
    id: 'green',
    name: '멜로우 그린',
    primary: '#10b981',
    secondary: '#34d399',
    bg: '#f0fdf4',
    cardBg: '#ffffff',
    text: '#064e3b',
    subText: '#10b981',
    border: '#dcfce7',
    thumbnail: 'https://images.unsplash.com/photo-1614850523011-8f49ffc73908?w=400&q=80'
  },
  {
    id: 'black',
    name: '모노 앤틱',
    primary: '#27272a',
    secondary: '#52525b',
    bg: '#f4f4f5',
    cardBg: '#ffffff',
    text: '#18181b',
    subText: '#71717a',
    border: '#e4e4e7',
    thumbnail: 'https://images.unsplash.com/photo-1614850523028-e4b216599b4d?w=400&q=80',
    isDark: false
  }
];
