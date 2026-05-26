import React from 'react';
import Footer from '../components/Footer';
import { useSiteContext } from '../context/SiteContext';
import { motion } from 'motion/react';

export default function PartnersPage() {
  const { settings } = useSiteContext();
  const partners = settings?.partners?.filter(p => !p.hidden) || [];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden flex flex-col">
      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-20 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black tracking-tight mb-6"
          >
            파트너사 모집
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto"
          >
            헤어딜과 함께 성장할 파트너를 모십니다. 전국 미용인들에게 혁신적인 서비스를 제공하며 새로운 시장을 개척할 역량 있는 파트너사를 기다립니다.
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="bg-gray-50 rounded-3xl p-8 md:p-12 mb-12 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-6">모집 분야</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-2 text-brand-primary">비즈니스 파트너</h3>
                <p className="text-gray-600 text-sm">헤어딜 솔루션 도입 및 영업, 마케팅 협력 파트너</p>
              </div>
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-2 text-brand-primary">기술/솔루션 파트너</h3>
                <p className="text-gray-600 text-sm">시스템 연동, 미용 산업 IT 솔루션 제휴 파트너</p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">함께 하는 파트너</h2>
            <p className="text-gray-500 mb-10">이미 많은 기업들이 헤어딜과 함께하고 있습니다.</p>
          </div>
        </div>

        {/* Scrolling Partners */}
        {partners.length > 0 && (
          <div className="w-full bg-gray-50 py-16 border-y border-gray-100 overflow-hidden relative">
            <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-gray-50 to-transparent z-10"></div>
            <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-gray-50 to-transparent z-10"></div>
            
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
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
