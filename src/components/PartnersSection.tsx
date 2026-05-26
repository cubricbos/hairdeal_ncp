import React from 'react';
import { useSiteContext } from '../context/SiteContext';

export default function PartnersSection() {
  const { settings } = useSiteContext();
  const partners = settings?.partners?.filter(p => !p.hidden) || [];
  const useWhiteBg = settings?.partnerSettings?.useWhiteBg !== false;

  if (partners.length === 0) return null;

  return (
    <section className={`w-full py-16 border-y overflow-hidden relative ${useWhiteBg ? 'bg-white border-gray-100' : 'bg-gray-50 border-gray-200'}`}>
      <div className={`absolute left-0 top-0 w-32 h-full z-10 bg-gradient-to-r ${useWhiteBg ? 'from-white' : 'from-gray-50'} to-transparent`}></div>
      <div className={`absolute right-0 top-0 w-32 h-full z-10 bg-gradient-to-l ${useWhiteBg ? 'from-white' : 'from-gray-50'} to-transparent`}></div>
      
      <div className="flex animate-scroll-left min-w-max hover:animation-pause">
        {/* Double array for seamless loop */}
        {[...partners, ...partners, ...partners].map((partner, idx) => (
          <div key={`${partner.id}-${idx}`} className="flex-shrink-0 px-8 flex items-center justify-center">
            {partner.linkUrl ? (
              <a href={partner.linkUrl} target="_blank" rel="noopener noreferrer" className="block transition-transform hover:scale-110">
                <img 
                  src={partner.logoImage} 
                  alt={partner.name || 'Partner Logo'} 
                  className="h-16 md:h-20 w-auto object-contain grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100" 
                />
              </a>
            ) : (
              <img 
                src={partner.logoImage} 
                alt={partner.name || 'Partner Logo'} 
                className="h-16 md:h-20 w-auto object-contain grayscale opacity-70" 
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
