import { useState } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { useSiteContext } from '../context/SiteContext';

export default function Pricing() {
  const { settings } = useSiteContext();
  const [isYearly, setIsYearly] = useState(false);
  const pricing = settings.pricing;
  const plans = pricing.plans.filter(p => !p.hidden);

  return (
    <section id="pricing" className={`py-24 overflow-hidden ${pricing.useWhiteBg !== false ? 'bg-white' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 sm:mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-950"
            dangerouslySetInnerHTML={{ __html: pricing.title }}
          />
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-gray-500 font-medium sm:text-lg mb-8"
            dangerouslySetInnerHTML={{ __html: pricing.subtitle.replace(/\\n/g, '<br/>') }}
          />
          
          {pricing.yearlyBillingEnabled && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center justify-center gap-4"
            >
              <span className={`text-sm font-bold ${!isYearly ? 'text-gray-900' : 'text-gray-400'}`}>월 결제</span>
              <button 
                onClick={() => setIsYearly(!isYearly)}
                className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-200 transition-colors focus:outline-none"
                style={{ backgroundColor: isYearly ? 'var(--color-brand-primary)' : '#e5e7eb' }}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isYearly ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
              <span className={`text-sm font-bold flex items-center gap-2 ${isYearly ? 'text-gray-900' : 'text-gray-400'}`}>
                연 결제
                {pricing.yearlyDiscountRate > 0 && (
                  <span className="bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">
                    {pricing.yearlyDiscountRate}% 할인
                  </span>
                )}
              </span>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch justify-center">
          {plans.map((plan, i) => {
            const hasIndividualDiscount = (plan.individualDiscountEnabled ?? true) && plan.individualDiscountRate > 0;
            const actualPrice = plan.monthlyPrice * (1 - (hasIndividualDiscount ? (plan.individualDiscountRate / 100) : 0));
            const rawDisplayPrice = isYearly && pricing.yearlyBillingEnabled
              ? ((plan.applyIndividualDiscountToYearly && hasIndividualDiscount) ? actualPrice : plan.monthlyPrice) * 12 * (1 - (pricing.yearlyDiscountRate / 100))
              : actualPrice;
            const displayPrice = Math.round(rawDisplayPrice / 1000) * 1000;
              
            return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className={`relative p-6 sm:p-8 rounded-[2rem] border max-w-sm w-full mx-auto md:max-w-none ${
                plan.isPopular ? 'border-brand-primary shadow-2xl scale-100 md:scale-105 bg-white z-10' : 'border-gray-100 bg-white'
              } flex flex-col`}
            >
              {plan.isPopular && plan.popularText && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-primary text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-md whitespace-nowrap">
                  {plan.popularText}
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2 text-gray-900">{plan.name}</h3>
                <p className="text-gray-400 text-sm font-medium">{plan.subtitle}</p>
              </div>
              <div className="mb-8 flex flex-col">
                {hasIndividualDiscount && (!isYearly || !pricing.yearlyBillingEnabled || plan.applyIndividualDiscountToYearly) && (
                   <span className="text-sm font-bold text-red-500 mb-1">{plan.individualDiscountRate}% 할인 프로모션</span>
                )}
                <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-gray-900">₩{displayPrice.toLocaleString()}</span>
                    <span className="text-gray-400 text-sm font-medium mb-1">/{isYearly && pricing.yearlyBillingEnabled ? '연' : '월'}</span>
                </div>
                {((hasIndividualDiscount && (!isYearly || !pricing.yearlyBillingEnabled || plan.applyIndividualDiscountToYearly)) || (isYearly && pricing.yearlyBillingEnabled && pricing.yearlyDiscountRate > 0)) && (
                   <span className="text-gray-400 text-sm line-through mt-1">₩{(isYearly && pricing.yearlyBillingEnabled ? plan.monthlyPrice * 12 : plan.monthlyPrice).toLocaleString()}</span>
                )}
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature.id} className="flex items-start gap-3 text-sm text-gray-600 font-medium">
                    <Check className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{feature.text}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const link = (plan.buttonLink || '#').trim();
                  
                  if (link === '#') {
                      window.dispatchEvent(new CustomEvent('open-auth'));
                  } else if (link === '#inquiry') {
                      window.dispatchEvent(new CustomEvent('open-inquiry'));
                  } else {
                      window.location.href = link;
                  }
                }}
                className={`w-full py-4 rounded-xl font-bold transition-all ${
                plan.buttonStyle === 'primary' ? 'bg-brand-primary text-white hover:bg-brand-primary/90 shadow-lg' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}>
                {plan.buttonText}
              </button>
            </motion.div>
          )})}
        </div>
      </div>
    </section>
  );
}
