import React from 'react';
import { motion } from 'motion/react';
import { CalendarCheck, Users, PieChart, MessageSquare, Smartphone, Zap, CheckCircle2 } from 'lucide-react';
import { useSiteContext } from '../context/SiteContext';
import * as Icons from 'lucide-react';

const colorArray = [
    "bg-gray-50 text-gray-600",
    "bg-gray-50 text-gray-600",
    "bg-gray-50 text-gray-600",
    "bg-gray-50 text-gray-600",
    "bg-gray-50 text-gray-600",
    "bg-gray-50 text-gray-600",
];

export default function Features() {
  const { settings } = useSiteContext();
  const featuresList = settings.features.items.filter(item => !item.hidden);

  return (
    <section id="features" className={`py-32 relative overflow-hidden ${settings.features.useWhiteBg ? 'bg-white' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-8 tracking-tighter"
            dangerouslySetInnerHTML={{ __html: settings?.features?.title || '기본에 충실한 <span class="gradient-text">운영 관리</span>' }}
          />
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-text-light max-w-2xl mx-auto font-medium leading-relaxed text-lg sm:text-xl whitespace-pre-wrap"
          >
            {(settings?.features?.subtitle || "이미 수만 명의 디자이너가 검증한 '네이버'의 노하우를 그대로 담았습니다. \n운영은 '헤어딜'에 맡기고, 디자이너님은 시술에만 집중하세요.").split('\\n').map((line: string, i: number) => (
              <React.Fragment key={i}>
                {line}
                {i !== (settings?.features?.subtitle || "").split('\\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </motion.p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 lg:gap-8">
          {featuresList.map((feature, index) => {
            const colorClass = colorArray[index % colorArray.length];
            const iconType = feature.iconType || 'lucide';
            
            let IconDisplay = null;
            if (iconType === 'emoji') {
               IconDisplay = <span className="text-2xl sm:text-4xl group-hover:text-white transition-colors">{feature.icon}</span>;
            } else if (iconType === 'image') {
               IconDisplay = <img src={feature.icon} alt={feature.title} className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />;
            } else {
               const IconComponent = (Icons as any)[feature.icon] || CheckCircle2;
               IconDisplay = <IconComponent className="w-6 h-6 sm:w-8 sm:h-8" />;
            }

            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="p-5 sm:p-8 lg:p-10 rounded-2xl sm:rounded-[32px] bg-white border border-gray-100 hover:shadow-2xl transition-all group flex flex-col items-start"
              >
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl ${colorClass} flex items-center justify-center mb-4 sm:mb-8 group-hover:bg-brand-primary group-hover:text-white transition-all duration-300 shrink-0`}>
                  {IconDisplay}
                </div>
                <h3 className="text-base sm:text-xl lg:text-2xl font-extrabold mb-2 sm:mb-4 text-text-dark">{feature.title}</h3>
                <p className="text-text-light font-medium leading-normal sm:leading-relaxed text-[11px] sm:text-sm lg:text-base">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
