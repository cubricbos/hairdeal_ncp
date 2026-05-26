import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Building2, User, Mail, Phone, MessageSquare } from 'lucide-react';
import React, { useState } from 'react';
import { supabase } from '../supabase';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InquiryModal({ isOpen, onClose }: InquiryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    salon_name: '',
    contact_name: '',
    phone: '',
    email: '',
    details: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('inquiries').insert([
        {
          salon_name: formData.salon_name,
          contact_name: formData.contact_name,
          phone: formData.phone,
          email: formData.email,
          details: formData.details
        }
      ]);

      if (error) throw error;

      setIsSuccess(true);
      // Reset form
      setFormData({
        salon_name: '',
        contact_name: '',
        phone: '',
        email: '',
        details: ''
      });
      
      // Keep success message for 3 seconds, then close
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      alert("문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[105] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl pointer-events-auto overflow-hidden border border-gray-100"
            >
              {isSuccess ? (
                <div className="p-10 text-center">
                  <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">문의가 접수되었습니다!</h3>
                  <p className="text-gray-500">
                    빠른 시일 내에 담당자가 연락드리겠습니다.<br />
                    관심 가져주셔서 감사합니다.
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-6 sm:p-8 relative">
                    <button
                      onClick={onClose}
                      className="absolute right-6 top-6 p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">프리미엄 살롱 도입 문의</h2>
                    <p className="text-sm text-gray-500 mb-8">
                      아래 양식을 남겨주시면 담당자가 신속히 안내해 드리겠습니다.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="salon_name"
                            value={formData.salon_name}
                            onChange={handleChange}
                            required
                            placeholder="살롱 이름 (미용실명)"
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-12 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-medium"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="contact_name"
                            value={formData.contact_name}
                            onChange={handleChange}
                            required
                            placeholder="성함 (직급)"
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-12 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-medium"
                          />
                        </div>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            placeholder="연락처"
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-12 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-medium"
                          />
                        </div>
                      </div>

                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="이메일 주소"
                          className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-12 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-medium"
                        />
                      </div>

                      <div className="relative">
                        <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                        <textarea
                          placeholder="문의 내용 (지점 수, 도입 희망 시기 등)"
                          name="details"
                          value={formData.details}
                          onChange={handleChange}
                          rows={3}
                          className="w-full bg-gray-50 border border-gray-200 text-gray-900 pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-medium resize-none"
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-brand-primary text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-primary/90 active:scale-[0.98] transition-all mt-4 disabled:opacity-70"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            문의 접수하기 <Send className="w-4 h-4 ml-1" />
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
