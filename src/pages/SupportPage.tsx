import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { User } from "@supabase/supabase-js";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AlertTriangle,
  Megaphone,
  Plus,
  MessageSquare,
  Clock,
  X,
  CreditCard,
  MonitorOff,
  HelpCircle,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useSiteContext } from "../context/SiteContext";

interface CsIncident {
  id: string;
  title: string;
  description: string;
  severity: number;
  status: string;
  resolved_at: string;
  created_at: string;
  reporter_id: string;
}

interface CsNotice {
  id: string;
  title: string;
  content: string;
  is_published: boolean;
  created_at: string;
}

export default function SupportPage({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSiteContext();
  const [activeTab, setActiveTab] = useState<"notices" | "events" | "inquiries">(
    location.state?.tab || "notices"
  );
  const [notices, setNotices] = useState<CsNotice[]>([]);
  const [incidents, setIncidents] = useState<CsIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Inquiry Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inquiryType, setInquiryType] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch Notices
      const { data: noticesData } = await supabase
        .from("cs_notices")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (noticesData) {
        setNotices(noticesData);
      }

      // Fetch User's Inquiries if logged in
      if (user) {
        const { data: incidentData } = await supabase
          .from("cs_incidents")
          .select("*")
          .eq("reporter_id", user.id)
          .order("created_at", { ascending: false });

        if (incidentData) {
          setIncidents(incidentData);
        }
      }
    } catch (error: any) {
      if (error?.message !== 'Failed to fetch' && error?.message !== 'FetchError') {
        console.error("Error fetching support data:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitInquiry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const severity = parseInt(formData.get("severity") as string, 10);

    try {
      const { error } = await supabase.from("cs_incidents").insert([
        {
          title,
          description,
          severity,
          reporter_id: user.id,
          status: "open",
        },
      ]);

      if (error) throw error;

      alert("문의가 접수되었습니다. 최대한 빠르게 답변드리겠습니다.");
      setIsModalOpen(false);
      setActiveTab("inquiries");
      fetchData();
    } catch (err: any) {
      alert("접수 실패: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 font-bold text-xs rounded-full">접수됨 / 검토 대기</span>;
      case "investigating":
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold text-xs rounded-full">확인 및 조치중</span>;
      case "resolved":
      case "closed":
        return <span className="px-3 py-1 bg-green-100 text-green-700 font-bold text-xs rounded-full">조치 완료</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-32">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-black text-gray-900 mb-2">고객센터 / 지원</h1>
        <p className="text-gray-500 mb-8 font-medium">공지사항을 확인하거나 이용 중 겪으신 장애 및 불편사항을 접수해주세요.</p>

        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("notices")}
            className={`pb-4 px-4 font-bold transition-colors text-lg relative ${
              activeTab === "notices" ? "text-brand-primary" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            공지사항
            {activeTab === "notices" && (
              <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`pb-4 px-4 font-bold transition-colors text-lg relative ${
              activeTab === "events" ? "text-brand-primary" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            이벤트
            {activeTab === "events" && (
              <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("inquiries")}
            className={`pb-4 px-4 font-bold transition-colors text-lg relative ${
              activeTab === "inquiries" ? "text-brand-primary" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            내 문의 내역
            {activeTab === "inquiries" && (
              <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary rounded-t-full" />
            )}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "notices" && (
            <motion.div
              key="notices"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {isLoading ? (
                <div className="text-center py-12 text-gray-400">불러오는 중...</div>
              ) : notices.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                  <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">등록된 공지사항이 없습니다.</p>
                </div>
              ) : (
                notices.map((notice) => (
                  <div key={notice.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-indigo-100 text-indigo-700 px-3 py-1 text-xs font-bold rounded-full">공지</span>
                      <span className="text-gray-400 text-sm font-medium">{new Date(notice.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{notice.title}</h3>
                    <div className="text-gray-600 whitespace-pre-wrap leading-relaxed text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                      {notice.content}
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === "events" && (
            <motion.div
              key="events"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {(!settings.eventPosts || settings.eventPosts.filter(p => p.isPublished).length === 0) ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                  <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">진행 중인 이벤트가 없습니다.</p>
                </div>
              ) : (
                settings.eventPosts.filter(p => p.isPublished).map((post) => (
                  <div key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                    {post.imageUrl && (
                      <div className="w-full aspect-[2/1] sm:aspect-[3/1] bg-gray-100 relative">
                        <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="bg-brand-primary/10 text-brand-primary px-3 py-1 text-xs font-bold rounded-full">이벤트</span>
                        {post.createdAt && <span className="text-gray-400 text-sm font-medium">{new Date(post.createdAt).toLocaleDateString()}</span>}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{post.title}</h3>
                      <div className="text-gray-600 whitespace-pre-wrap leading-relaxed text-sm bg-gray-50 p-4 rounded-xl border border-gray-100" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === "inquiries" && (
            <motion.div
              key="inquiries"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {!user ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium mb-6">문의 내역을 확인하려면 로그인이 필요합니다.</p>
                  <button onClick={() => navigate('/')} className="bg-brand-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-primary/90 transition-colors">
                    메인으로 돌아가기
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex justify-end mb-6">
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="bg-brand-primary text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-primary/90 transition-all shadow-md shadow-brand-primary/20"
                    >
                      <Plus className="w-5 h-5" />
                      새 문의 / 장애 신고
                    </button>
                  </div>

                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="text-center py-12 text-gray-400">불러오는 중...</div>
                    ) : incidents.length === 0 ? (
                      <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                         <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                         <p className="text-gray-500 font-medium">접수하신 문의 내역이 없습니다.</p>
                      </div>
                    ) : (
                      incidents.map((inc) => (
                        <div key={inc.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-start justify-between gap-6">
                           <div className="flex-1">
                             <div className="flex items-center gap-3 mb-3">
                                {getStatusBadge(inc.status)}
                                <span className="text-gray-400 text-sm font-medium">{new Date(inc.created_at).toLocaleDateString()}</span>
                             </div>
                             <h3 className="text-lg font-bold text-gray-900 mb-2">{inc.title}</h3>
                             <p className="text-gray-600 text-sm leading-relaxed mb-4">{inc.description}</p>
                             
                             {(inc.status === 'resolved' || inc.status === 'closed') && (
                               <div className="bg-green-50/50 p-4 rounded-xl border border-green-100 flex items-start gap-3 mt-4">
                                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                  <div>
                                    <h4 className="text-sm font-bold text-green-900 mb-1">조치 완료</h4>
                                    <p className="text-sm text-green-800">해당 불편사항 및 장애가 조치되었습니다. 이용에 불편을 드려 죄송합니다.</p>
                                  </div>
                               </div>
                             )}
                           </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* New Inquiry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-2xl my-auto shadow-2xl overflow-hidden relative"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xl font-black text-gray-900">장애 신고 및 1:1 문의</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 bg-white rounded-full shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitInquiry} className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">문의 유형을 선택해주세요</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <label className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2 transition-all ${inquiryType === 2 ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}>
                      <input type="radio" required name="severity" value={2} className="hidden" checked={inquiryType === 2} onChange={() => setInquiryType(2)} />
                      <CreditCard className="w-6 h-6" />
                      <span className="text-xs font-bold">결제/환불 문제</span>
                    </label>
                    <label className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2 transition-all ${inquiryType === 1 ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}>
                      <input type="radio" required name="severity" value={1} className="hidden" checked={inquiryType === 1} onChange={() => setInquiryType(1)} />
                      <MonitorOff className="w-6 h-6" />
                      <span className="text-xs font-bold">시스템/기능 장애</span>
                    </label>
                    <label className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2 transition-all ${inquiryType === 3 ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}>
                      <input type="radio" required name="severity" value={3} className="hidden" checked={inquiryType === 3} onChange={() => setInquiryType(3)} />
                      <HelpCircle className="w-6 h-6" />
                      <span className="text-xs font-bold">이용 방법 문의</span>
                    </label>
                    <label className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2 transition-all ${inquiryType === 4 ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}>
                      <input type="radio" required name="severity" value={4} className="hidden" checked={inquiryType === 4} onChange={() => setInquiryType(4)} />
                      <MessageSquare className="w-6 h-6" />
                      <span className="text-xs font-bold">기타 제안/건의</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">제목</label>
                  <input required name="title" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary/50 focus:outline-none transition-all font-medium" placeholder="문의하실 내용을 간략히 적어주세요." />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">상세 내용</label>
                  <textarea required name="description" rows={5} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary/50 focus:outline-none transition-all font-medium resize-none" placeholder="오류 발생 시 발생 일시, 브라우저 환경, 그리고 구체적인 증상을 적어주시면 더 빠른 해결이 가능합니다."></textarea>
                </div>
              </div>

              <div className="flex gap-3 pt-6 mt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors w-1/3" disabled={isSubmitting}>취소</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3.5 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/20 disabled:opacity-50">
                  {isSubmitting ? "접수 중..." : "문의 접수하기"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
