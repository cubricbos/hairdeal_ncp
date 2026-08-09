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
    // 1. Instant local preview for blob or data URLs
    if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
      list.push(trimmed);
      return;
    }

    let fileName = '';

    // Extract fileName from various patterns
    if (trimmed.includes('fileName=')) {
      const match = trimmed.match(/fileName=([^&]+)/);
      if (match) fileName = match[1];
    } else if (trimmed.includes('/storage/')) {
      const parts = trimmed.split('/storage/');
      fileName = parts[parts.length - 1];
    } else if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const urlParts = trimmed.split('?')[0].split('/');
      const lastSeg = urlParts[urlParts.length - 1];
      if (lastSeg && lastSeg.length > 2) {
        fileName = lastSeg;
      }
      list.push(trimmed);
    } else if (trimmed.startsWith('/')) {
      list.push(trimmed);
      const urlParts = trimmed.split('?')[0].split('/');
      const lastSeg = urlParts[urlParts.length - 1];
      if (lastSeg && lastSeg.length > 2) {
        fileName = lastSeg;
      }
    } else {
      // Pure file name, ID, or hash
      fileName = trimmed;
    }

    if (fileName) {
      // Strip any query parameters or hash from fileName
      fileName = fileName.split('?')[0].split('#')[0];

      // Primary proxy endpoints
      list.push(`/api/account/storage?fileName=${fileName}`);
      list.push(`/api/storage?fileName=${fileName}`);
      list.push(`/api/core/storage?fileName=${fileName}`);
      list.push(`/api/api/storage?fileName=${fileName}`);
      list.push(`https://api.cubric.io/api/storage?fileName=${fileName}`);

      if (!fileName.includes('.')) {
        list.push(`/api/account/storage?fileName=${fileName}.jpeg`);
        list.push(`/api/storage?fileName=${fileName}.jpeg`);
        list.push(`/api/core/storage?fileName=${fileName}.jpeg`);
        list.push(`/api/api/storage?fileName=${fileName}.jpeg`);
        list.push(`https://api.cubric.io/api/storage?fileName=${fileName}.jpeg`);

        list.push(`/api/account/storage?fileName=${fileName}.jpg`);
        list.push(`/api/storage?fileName=${fileName}.jpg`);
        list.push(`/api/core/storage?fileName=${fileName}.jpg`);
        list.push(`/api/api/storage?fileName=${fileName}.jpg`);
        list.push(`https://api.cubric.io/api/storage?fileName=${fileName}.jpg`);

        list.push(`/api/account/storage?fileName=${fileName}.png`);
        list.push(`/api/storage?fileName=${fileName}.png`);
        list.push(`/api/core/storage?fileName=${fileName}.png`);
        list.push(`/api/api/storage?fileName=${fileName}.png`);
        list.push(`https://api.cubric.io/api/storage?fileName=${fileName}.png`);

        list.push(`/api/account/storage?fileName=${fileName}.webp`);
        list.push(`/api/storage?fileName=${fileName}.webp`);
        list.push(`/api/core/storage?fileName=${fileName}.webp`);
        list.push(`/api/api/storage?fileName=${fileName}.webp`);
        list.push(`https://api.cubric.io/api/storage?fileName=${fileName}.webp`);
      }

      list.push(`https://api.cubric.io/storage/${fileName}`);
      list.push(`/storage/${fileName}`);
    }
  });

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
