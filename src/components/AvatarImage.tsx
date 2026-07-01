import React, { useState, useEffect } from 'react';
import { User as UserIcon } from 'lucide-react';

interface AvatarImageProps {
  url: string | undefined | null;
  className?: string;
  fallbackClassName?: string;
}

export const getAvatarCandidates = (originalUrl: string | undefined | null): string[] => {
  const list: string[] = [];
  if (!originalUrl) return list;

  const trimmedMain = originalUrl.trim();
  if (!trimmedMain) return list;

  const parts = trimmedMain.split(',').map(s => s.trim()).filter(Boolean);
  
  parts.forEach(trimmed => {
    // 1. Raw push - only if it starts with http, /, blob:, or data:
    if (trimmed.startsWith('http') || trimmed.startsWith('/') || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
      list.push(trimmed);
    }

    let fileName = '';

    // Case 1: Already a fully qualified URL with fileName query parameter
    if (trimmed.includes('fileName=')) {
      const match = trimmed.match(/fileName=([^&]+)/);
      if (match) {
        fileName = match[1];
      }
    } 
    // Case 2: Standard NCP account storage API path
    else if (trimmed.startsWith('/api/account/storage?fileName=')) {
      fileName = trimmed.replace('/api/account/storage?fileName=', '');
    }
    else if (trimmed.startsWith('/api/account/storage/')) {
      fileName = trimmed.replace('/api/account/storage/', '');
    }
    else if (trimmed.startsWith('/api/core/storage?fileName=')) {
      fileName = trimmed.replace('/api/core/storage?fileName=', '');
    }
    else if (trimmed.startsWith('/api/core/storage/')) {
      fileName = trimmed.replace('/api/core/storage/', '');
    }
    else if (trimmed.startsWith('https://api.cubric.io/api/storage?fileName=')) {
      fileName = trimmed.replace('https://api.cubric.io/api/storage?fileName=', '');
    } 
    // Case 3: Storage path directly (e.g., /storage/name)
    else if (trimmed.includes('/storage/')) {
      const parts = trimmed.split('/storage/');
      fileName = parts[parts.length - 1];
    } 
    // Case 4: Pure UUID or file name with extension
    else if (!trimmed.startsWith('http') && !trimmed.startsWith('/') && !trimmed.startsWith('blob:') && !trimmed.startsWith('data:') && (trimmed.match(/^[a-fA-F0-9-]{36}/) || trimmed.match(/^[0-9a-fA-F]{32}/) || trimmed.includes('.'))) {
      fileName = trimmed;
    }

    // If we extracted a fileName, prioritize NCP endpoints
    if (fileName) {
      list.push(`https://api.cubric.io/api/storage?fileName=${fileName}`);
      if (!fileName.includes('.')) {
        list.push(`https://api.cubric.io/api/storage?fileName=${fileName}.jpeg`);
        list.push(`https://api.cubric.io/api/storage?fileName=${fileName}.jpg`);
        list.push(`https://api.cubric.io/api/storage?fileName=${fileName}.png`);
      }
      list.push(`https://api.cubric.io/storage/${fileName}`);
      list.push(`/api/core/storage?fileName=${fileName}`);
      list.push(`/api/core/storage/${fileName}`);
      list.push(`/storage/${fileName}`);
    }
  });

  // Always append original url as a fallback if it starts with http, /, blob:, or data:
  if (trimmedMain.startsWith('http') || trimmedMain.startsWith('/') || trimmedMain.startsWith('blob:') || trimmedMain.startsWith('data:')) {
    list.push(trimmedMain);
  }

  return Array.from(new Set(list));
};

export const AvatarImage: React.FC<AvatarImageProps> = ({ 
  url, 
  className = "w-full h-full object-cover",
  fallbackClassName = "w-4 h-4 text-brand-primary"
}) => {
  const [errorIndex, setErrorIndex] = useState(0);
  const [candidates, setCandidates] = useState<string[]>([]);

  // Regenerate candidates whenever the URL changes
  useEffect(() => {
    setErrorIndex(0);
    setCandidates(getAvatarCandidates(url));
  }, [url]);

  if (!url || candidates.length === 0) {
    return <UserIcon className={fallbackClassName} />;
  }

  // If we exhausted all candidates, render the final fallback icon
  if (errorIndex >= candidates.length) {
    return <UserIcon className={fallbackClassName} />;
  }

  return (
    <img 
      src={candidates[errorIndex]} 
      alt="Profile Avatar" 
      className={className} 
      referrerPolicy="no-referrer"
      onError={() => {
        setErrorIndex(prev => prev + 1);
      }}
    />
  );
};
