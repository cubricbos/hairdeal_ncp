import { motion, AnimatePresence, useMotionValue, useTransform, animate, useInView } from 'motion/react';
import { Sparkles, ArrowRight, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Home, Search, PlusSquare, User, Camera } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useMetrics } from '../hooks/useMetrics';
import { useSiteContext } from '../context/SiteContext';

// Utility for hex color to rgba conversion
function hexToRgba(hex: string, alpha: number) {
  let r = 255, g = 255, b = 255;
  if (hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Counter component for animated statistics
function Counter({ value, decimals = 0 }: { value: number, decimals?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    // If value is less than 1, just format normally without decimals to avoid weird floating points unless requested
    return latest.toFixed(decimals);
  });
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  useEffect(() => {
    if (isInView) {
      const animation = animate(count, value, {
        duration: 2,
        ease: "easeOut",
      });
      return animation.stop;
    }
  }, [value, count, isInView]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const metrics = useMetrics();
  const { settings } = useSiteContext();
  const hero = settings.hero;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // High-end Video "Frame Motion" effect simulation
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5; // Slow-motion "frame" feel
    }
  }, []);

  // Handle fading slider animation
  useEffect(() => {
    if (hero.bgType === 'image' && (hero.bgAnimation === 'fade-slider' || hero.bgAnimation === 'zoom-fade-slider') && hero.bgImages && hero.bgImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % hero.bgImages!.length);
      }, (hero.bgTransitionTime || 3) * 1000);
      return () => clearInterval(interval);
    }
  }, [hero.bgType, hero.bgAnimation, hero.bgImages, hero.bgTransitionTime]);

  // Handle fallback images
  const imagesToRenderRaw = hero.bgImages && hero.bgImages.length > 0
    ? hero.bgImages
    : (hero.bgImage ? [hero.bgImage] : ['https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2070&auto=format&fit=crop']);
  
  const imagesToRender = imagesToRenderRaw.map((img: any) => typeof img === 'string' ? img : img.url);

  // Preload images to remove pop-in effect on mount
  useEffect(() => {
    if (imagesToRender && imagesToRender.length > 0) {
      imagesToRender.forEach(src => {
        if (src) {
          const img = new Image();
          img.src = src;
        }
      });
      document.body.classList.add('images-preloaded');
    }
  }, [imagesToRender]);

  return (
    <section className="relative min-h-[95svh] flex items-center pt-40 pb-20 px-8 sm:px-16 lg:px-24 xl:px-32 overflow-hidden" style={{ backgroundColor: hero.bgColor || '#000000' }}>
      {/* Dynamic Background Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
         {hero.bgType === 'video' ? (
           <div className="absolute inset-0 w-full h-full bg-black/20">
              <video 
                ref={videoRef}
                autoPlay loop muted playsInline 
                className={`w-full h-full object-cover opacity-60 saturate-[1.1] ${hero.bgAnimation === 'zoom-out' ? 'scale-105 animate-pulse' : ''}`}
              >
               <source src={hero.bgVideo || "https://github.com/cubricbos/data/raw/main/video/main_video.mp4"} type="video/mp4" />
             </video>
           </div>
         ) : hero.bgAnimation === 'fade-slider' || hero.bgAnimation === 'zoom-fade-slider' ? (
           <AnimatePresence initial={hero.bgShowFirstImageImmediately === false}>
             <motion.div
               key={`bg-slider-${currentImageIndex}`}
               initial={{ 
                 opacity: 0, 
                 scale: 1,
                 zIndex: 1
               }}
               animate={{ 
                 opacity: 1, 
                 scale: hero.bgAnimation === 'zoom-fade-slider' ? 1.05 : 1,
                 zIndex: 1
               }}
               exit={{ 
                 opacity: 0.99, // Keep old image visible while next fades in on top
                 scale: hero.bgAnimation === 'zoom-fade-slider' ? 1.1 : 1,
                 zIndex: 0 // Push to background
               }}
               transition={{ 
                 opacity: { duration: 1.5, ease: "easeInOut" },
                 scale: { duration: (hero.bgTransitionTime || 3) + 1.5, ease: "linear" },
                 zIndex: { duration: 0 } // Snap z-index immediately
               }}
               className="absolute inset-0 w-full h-full bg-cover bg-center origin-center"
               style={{ backgroundImage: `url(${imagesToRender[currentImageIndex]})` }}
             />
           </AnimatePresence>
         ) : (
           <div className={`absolute inset-0 w-full h-full bg-cover bg-center ${hero.bgAnimation === 'zoom-out' ? 'scale-105 animate-[pulse_4s_ease-in-out_infinite]' : ''}`} 
                style={{ backgroundImage: `url(${imagesToRender[0]})` }} />
         )}
        
        {/* Frame-Motion Texture Overlay (Noise/Grain for cinematic feel) */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-black" />
        
        {/* Professional Overlays for Readability - Configurable via CMS */}
        <div 
          className="absolute inset-0 z-1" 
          style={{
            background: `linear-gradient(to right, 
              ${hexToRgba(hero.overlayStartColor || '#ffffff', (hero.overlayStartOpacity ?? 100) / 100)}, 
              ${hexToRgba(hero.overlayEndColor || '#ffffff', (hero.overlayEndOpacity ?? 0) / 100)})`
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto w-full flex flex-col justify-center items-center text-center relative z-10">
        
        {/* Typography */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-10 flex flex-col items-center"
        >
          {/* Minimal High-Tech Badge */}
          {hero.showBadge && (
             <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-primary/10 rounded-full border border-brand-primary/20 backdrop-blur-sm">
               <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
               <span className="text-[11px] font-bold text-brand-primary uppercase tracking-[0.2em]">{hero.badgeText}</span>
             </div>
          )}

          <h1 
            className={`text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-[900] leading-[1.05] tracking-[-0.05em] ${!hero.titleColor ? 'text-text-dark' : ''}`}
            style={hero.titleColor ? { color: hero.titleColor } : undefined}
            dangerouslySetInnerHTML={{ __html: hero.title }}
          />

          <div className="space-y-6">
            <p 
              className={`text-xl sm:text-2xl font-medium leading-relaxed max-w-2xl text-center ${!hero.subtitleColor ? 'text-text-light' : ''}`}
              style={hero.subtitleColor ? { color: hero.subtitleColor } : undefined}
              dangerouslySetInnerHTML={{ __html: hero.subtitle.replace(/\\n/g, '<br/>') }}
            />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 pt-6"
          >
            {hero.primaryBtnBase && (
              <button 
                onClick={() => {
                  if (hero.primaryBtnLink === '#') window.dispatchEvent(new CustomEvent('open-auth'));
                  else {
                    const link = hero.primaryBtnLink.startsWith('#') ? '/' + hero.primaryBtnLink : hero.primaryBtnLink;
                    window.location.href = link;
                  }
                }}
                className="group relative bg-brand-primary text-white px-8 py-4 rounded-[20px] font-bold text-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 overflow-hidden"
              >
                <span>{hero.primaryBtnBase}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
            {hero.secondaryBtnBase && (
              <button 
                onClick={() => {
                  if (hero.secondaryBtnLink === '#') window.dispatchEvent(new CustomEvent('open-inquiry'));
                  else {
                    const link = hero.secondaryBtnLink.startsWith('#') ? '/' + hero.secondaryBtnLink : hero.secondaryBtnLink;
                    window.location.href = link;
                  }
                }}
                className="bg-white/70 backdrop-blur-xl text-text-dark border-2 border-gray-100 px-8 py-4 rounded-[20px] font-bold text-lg hover:border-brand-primary/30 hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                {hero.secondaryBtnBase}
              </button>
            )}
          </motion.div>

          {/* Simple Trust Metrics */}
          <div 
            className="pt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-8 border-t border-gray-200/50 min-w-[300px]"
            style={hero.metricsColor ? { color: hero.metricsColor } : { filter: 'grayscale(100%)', opacity: 0.5 }}
          >
            {hero.metrics.showVisits && (
              <div className="flex flex-col items-center">
                <span className={`text-xl font-black ${!hero.metricsColor ? 'text-text-dark' : ''}`}>
                  <Counter value={metrics ? (metrics.totalVisits >= 1000 ? metrics.totalVisits / 1000 : metrics.totalVisits) : 120} />
                  {metrics && metrics.totalVisits < 1000 ? '' : 'k+'}
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-widest ${!hero.metricsColor ? 'text-text-light' : 'opacity-80'}`}>Total Visits</span>
              </div>
            )}

            {hero.metrics.showVisits && hero.metrics.showToday && (
              <div className="hidden sm:block w-[1px] h-8 bg-gray-300" style={hero.metricsColor ? { backgroundColor: hero.metricsColor, opacity: 0.3 } : {}} />
            )}

            {hero.metrics.showToday && (
              <div className="flex flex-col items-center">
                <span className={`text-xl font-black ${!hero.metricsColor ? 'text-text-dark' : ''}`}>
                  <Counter value={metrics ? metrics.todayVisits : 124} />
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-widest ${!hero.metricsColor ? 'text-text-light' : 'opacity-80'}`}>Today</span>
              </div>
            )}
            
            {hero.metrics.showToday && (hero.metrics.showActive || hero.metrics.showUsers) && (
              <div className="hidden sm:block w-[1px] h-8 bg-gray-300" style={hero.metricsColor ? { backgroundColor: hero.metricsColor, opacity: 0.3 } : {}} />
            )}

            {hero.metrics.showUsers && (
              <div className="flex flex-col items-center">
                <span className={`text-xl font-black ${!hero.metricsColor ? 'text-text-dark' : ''}`}>
                  <Counter value={metrics ? (metrics.totalUsers >= 1000 ? metrics.totalUsers / 1000 : metrics.totalUsers) : 15} />
                  {metrics && metrics.totalUsers < 1000 ? '' : 'k+'}
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-widest ${!hero.metricsColor ? 'text-text-light' : 'opacity-80'}`}>Total Users</span>
              </div>
            )}

            {hero.metrics.showUsers && hero.metrics.showActive && (
              <div className="hidden sm:block w-[1px] h-8 bg-gray-300" style={hero.metricsColor ? { backgroundColor: hero.metricsColor, opacity: 0.3 } : {}} />
            )}

            {hero.metrics.showActive && (
              <div className="flex flex-col items-center">
                <span className={`text-xl font-black ${!hero.metricsColor ? 'text-text-dark' : ''}`}>
                  <Counter value={metrics ? (metrics.activeUsers >= 1000 ? metrics.activeUsers / 1000 : metrics.activeUsers) : 2.4} decimals={metrics && metrics.activeUsers < 1000 ? 0 : 1} />
                  {metrics && metrics.activeUsers < 1000 ? '' : 'k+'}
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-widest ${!hero.metricsColor ? 'text-text-light' : 'opacity-80'}`}>Active Users</span>
              </div>
            )}

            {hero.metrics.showActive && hero.metrics.showSatisfaction && (
              <div className="hidden sm:block w-[1px] h-8 bg-gray-300" style={hero.metricsColor ? { backgroundColor: hero.metricsColor, opacity: 0.3 } : {}} />
            )}

            {hero.metrics.showSatisfaction && (
              <div className="flex flex-col items-center">
                <span className={`text-xl font-black ${!hero.metricsColor ? 'text-text-dark' : ''}`}>
                  <Counter value={98} />%
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-widest ${!hero.metricsColor ? 'text-text-light' : 'opacity-80'}`}>Satisfaction</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Decorative Blur Element */}
      <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-brand-primary/20 blur-[140px] rounded-full pointer-events-none" />
    </section>
  );
}
