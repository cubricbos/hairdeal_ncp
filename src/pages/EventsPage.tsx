import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, ChevronRight, Speaker, X } from 'lucide-react';
import { useSiteContext } from '../context/SiteContext';
import Footer from '../components/Footer';

export default function EventsPage({ user }: { user: any }) {
  const { settings } = useSiteContext();
  const events = (settings?.eventPosts || []).filter(e => e.isPublished);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  // Sort by created_at descending
  const sortedEvents = [...events].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="min-h-screen pt-24 bg-gray-50 flex flex-col">
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-black text-gray-900 mb-4 flex items-center gap-3">
            <Speaker className="w-8 h-8 text-brand-primary" /> 이벤트
          </h1>
          <p className="text-gray-500 font-medium">진행 중인 다양한 이벤트와 혜택을 확인하세요.</p>
        </div>

        {sortedEvents.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-lg text-gray-500 font-medium">현재 진행 중인 이벤트가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedEvents.map(event => (
              <motion.div
                key={event.id}
                viewport={{ once: true }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedEvent(event)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 cursor-pointer group flex flex-col"
              >
                {event.imageUrl ? (
                  <div className="w-full aspect-[4/3] overflow-hidden bg-gray-100">
                    <img 
                      src={event.imageUrl} 
                      alt={event.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[4/3] bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 flex items-center justify-center">
                    <Speaker className="w-12 h-12 text-brand-primary/20" />
                  </div>
                )}
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-3">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(event.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-brand-primary transition-colors">
                    {event.title}
                  </h3>
                  <div className="mt-auto flex items-center justify-end text-sm font-bold text-gray-400 group-hover:text-brand-primary transition-colors">
                    상세 보기 <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />

      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">{selectedEvent.title}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(selectedEvent.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors shrink-0"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              
              <div className="overflow-y-auto p-6 md:p-8">
                {selectedEvent.imageUrl && (
                  <div className="mb-8 rounded-xl overflow-hidden shadow-sm">
                    <img src={selectedEvent.imageUrl} alt={selectedEvent.title} className="w-full h-auto" />
                  </div>
                )}
                
                <div 
                  className="prose prose-lg max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: selectedEvent.contentHtml.replace(/\n/g, '<br/>') }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
