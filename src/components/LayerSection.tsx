import React from 'react';
import { motion } from 'motion/react';
import { useSiteContext } from '../context/SiteContext';
import { SiteSettings } from '../lib/siteSettings';

export default function LayerSection({ layer }: { layer: NonNullable<SiteSettings['layers']>[0]; key?: React.Key }) {
  if (layer.hidden) return null;

  return (
    <section 
      className={`py-32 relative overflow-hidden ${layer.useWhiteBg ? 'bg-white' : ''}`} 
      id={layer.anchorId?.startsWith('#') ? layer.anchorId.substring(1) : layer.anchorId}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-100px" }}
           transition={{ duration: 0.8 }}
           className={layer.useGlassCard !== false ? "glass-card p-12 sm:p-20 rounded-3xl" : "p-0"}
        >
          {layer.showTitle !== false && layer.title && (
             <h2 
               className="text-4xl sm:text-5xl lg:text-7xl font-[800] text-text-dark mb-8 tracking-[-0.03em] leading-[1.1]"
               dangerouslySetInnerHTML={{ __html: layer.title.replace(/\\n/g, '<br />') }}
             />
          )}
          {layer.showSubtitle !== false && layer.subtitle && (
             <p 
               className={`text-text-light text-lg sm:text-xl mb-12 mx-auto font-medium leading-relaxed break-keep tracking-tight ${layer.useGlassCard !== false ? 'max-w-3xl' : 'max-w-5xl'}`}
               dangerouslySetInnerHTML={{ __html: layer.subtitle.replace(/\\n/g, '<br />') }}
             />
          )}
          {layer.contentHtml && (
             <div 
                className={`text-left mx-auto mb-12 prose prose-lg ${layer.useGlassCard !== false ? 'max-w-4xl' : 'max-w-full'}`} 
                dangerouslySetInnerHTML={{ __html: layer.contentHtml }}
             />
          )}
          {( (layer.buttons && layer.buttons.length > 0) || layer.primaryBtn || layer.secondaryBtn ) && (
            <div className="flex flex-col sm:flex-row justify-center flex-wrap gap-6">
              {(layer.buttons && layer.buttons.length > 0) ? layer.buttons.map((btn, i) => (
                  <button
                    key={i}
                    onClick={() => {
                       if (btn.actionType === 'modal') {
                          if (btn.targetId === 'auth') window.dispatchEvent(new CustomEvent('open-auth'));
                       } else if (btn.actionType === 'link' && btn.linkUrl) {
                          window.location.href = btn.linkUrl;
                       } else if (btn.actionType === 'section' && btn.targetId) {
                          const target = btn.targetId.startsWith('#') ? btn.targetId : '#' + btn.targetId;
                          const el = document.querySelector(target);
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                       }
                    }}
                    className={`${btn.colorClass || 'bg-brand-primary text-white'} px-10 py-5 rounded-full font-bold text-lg sm:text-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all w-full sm:w-auto shadow-md`}
                  >
                    {btn.label}
                  </button>
              )) : (
                <>
                   {layer.primaryBtn && (
                      <button 
                        onClick={() => {
                          if (layer.primaryBtnLink === '#') window.dispatchEvent(new CustomEvent('open-auth'));
                          else window.location.href = layer.primaryBtnLink || '#';
                        }}
                        className={`${layer.primaryBtnColor || 'bg-brand-primary text-white'} px-10 py-5 rounded-full font-bold text-lg sm:text-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all w-full sm:w-auto shadow-md`}
                      >
                        {layer.primaryBtn}
                      </button>
                   )}
                   {layer.secondaryBtn && (
                      <button 
                        onClick={() => {
                          if (layer.secondaryBtnLink === '#') window.dispatchEvent(new CustomEvent('open-auth'));
                          else window.location.href = layer.secondaryBtnLink || '#';
                        }}
                        className={`${layer.secondaryBtnColor || 'bg-white text-text-dark border-2 border-gray-100'} px-10 py-5 rounded-full font-bold text-lg sm:text-xl hover:border-brand-primary/20 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto shadow-sm`}
                      >
                        {layer.secondaryBtn}
                      </button>
                   )}
                </>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
