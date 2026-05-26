import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Megaphone,
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  Search,
  LogOut,
  LayoutDashboard,
  ShieldAlert,
  X,
  Activity,
  MessageCircle,
  Menu,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import LiveChatAdmin from "../components/LiveChatAdmin";
import ChatbotEditor from "../components/ChatbotEditor";
import { logPrivacyAction } from "../lib/auditLogger";

interface CsIncident {
  id: string;
  title: string;
  description: string;
  severity: number;
  status: string;
  root_cause: string;
  prevention_plan: string;
  sla_deadline: string;
  created_at: string;
  updated_at: string;
  resolved_at: string;
  reporter_id: string;
  notify_customers: boolean;
}

interface CsNotice {
  id: string;
  title: string;
  content: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface Profile {
  id: string;
  email: string;
  full_name: string;
  credits: number;
  subscription_plan: string;
  subscription_status: string;
  created_at: string;
  business_status?: string;
}

// Helper to mask email for privacy in exports
const maskEmailForExport = (email: string) => {
  if (!email || !email.includes('@')) return email || '';
  const [id, domain] = email.split('@');
  if (id.length <= 3) {
    return id + '@' + domain;
  }
  return id.substring(0, 3) + '*'.repeat(id.length - 3) + '@' + domain;
};

export default function CsAdminPage({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [incidents, setIncidents] = useState<CsIncident[]>([]);
  const [notices, setNotices] = useState<CsNotice[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);

  // Search & Filter (Users)
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userSortField, setUserSortField] = useState<"created_at" | "credits">("created_at");
  const [userSortOrder, setUserSortOrder] = useState<"asc" | "desc">("desc");
  const [filterSubscription, setFilterSubscription] = useState<"all" | "active" | "free">("all");
  const [filterBusinessStatus, setFilterBusinessStatus] = useState<"all" | "active" | "dormant" | "closed">("all");

  // Search & Filter (Incidents)
  const [incidentSearchTerm, setIncidentSearchTerm] = useState("");
  const [incidentSortField, setIncidentSortField] = useState<"created_at" | "severity">("created_at");
  const [incidentSortOrder, setIncidentSortOrder] = useState<"asc" | "desc">("desc");
  const [filterSeverity, setFilterSeverity] = useState<"all" | "1" | "2" | "3" | "4">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "investigating" | "resolved" | "closed">("all");

  // Modals
  const [selectedIncident, setSelectedIncident] = useState<CsIncident | null>(null);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  
  const [selectedNotice, setSelectedNotice] = useState<CsNotice | null>(null);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      if (!user) {
        navigate("/");
        return;
      }

      // Check if user is CS Admin or Main Admin
      const isMainAdmin = user.email === "cubric.ceo@gmail.com";
      let isCsAdmin = false;

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_cs_admin")
          .eq("id", user.id)
          .single();

        isCsAdmin = profile?.is_cs_admin === true;
      } catch (err) {
        console.error("Error fetching profile role:", err);
      }

      if (!isMainAdmin && !isCsAdmin) {
        alert("접근 권한이 없습니다.");
        navigate("/");
        return;
      }

      setIsAuthorized(true);
      fetchData();
    };

    checkAuthAndFetchData();
  }, [user?.id, navigate]);

  useEffect(() => {
    // Update document title based on active tab
    const titleMap: Record<string, string> = {
      dashboard: "CS 대시보드",
      chats: "실시간 채팅 상담",
      chatbot: "챗봇 시나리오 관리",
      incidents: "장애 관리 (SLA)",
      notices: "고객 공지 관리",
      users: "통합 회원 조회"
    };
    document.title = `${titleMap[activeTab] || "CS 관리자"} - Cubric`;
  }, [activeTab]);

  const fetchData = async () => {
    if (incidents.length === 0 && notices.length === 0) {
      setIsLoading(true);
    }
    try {
      // Fetch Incidents
      const { data: incidentsData, error: incidentsError } = await supabase
        .from("cs_incidents")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (!incidentsError) {
        setIncidents(incidentsData || []);
      } else if (incidentsError.code === "42P01") {
        console.warn("cs_incidents table not found.");
      }

      // Fetch Notices
      const { data: noticesData, error: noticesError } = await supabase
        .from("cs_notices")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (!noticesError) {
        setNotices(noticesData || []);
      }

      // Fetch Users
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000); // Limit to prevent massive loads, use search for more
      
      if (!usersError) {
        setUsers(usersData || []);
        try {
          await logPrivacyAction('VIEW', 'profiles', 'ALL', { source: 'CsAdminPage_Load', limit: 1000 });
        } catch (e) {}
      }

    } catch (err) {
      console.error("Error fetching CS data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveIncident = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const incidentData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      severity: parseInt(formData.get("severity") as string),
      status: formData.get("status") as string,
      root_cause: formData.get("root_cause") as string,
      prevention_plan: formData.get("prevention_plan") as string,
      notify_customers: formData.get("notify_customers") === "on",
      sla_deadline: formData.get("sla_deadline") ? new Date(formData.get("sla_deadline") as string).toISOString() : null,
      reporter_id: user?.id,
      updated_at: new Date().toISOString()
    };

    try {
      if (selectedIncident?.id) {
        const { error } = await supabase
          .from("cs_incidents")
          .update({ ...incidentData, resolved_at: incidentData.status === 'resolved' || incidentData.status === 'closed' ? new Date().toISOString() : null })
          .eq("id", selectedIncident.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("cs_incidents")
          .insert([incidentData]);
        if (error) throw error;
      }

      // Auto-draft notice logic
      const shouldCreateNotice = incidentData.notify_customers && (!selectedIncident || !selectedIncident.notify_customers);
      if (shouldCreateNotice) {
        try {
          const { error: noticeErr } = await supabase.from("cs_notices").insert([{
            title: `[장애 안내] ${incidentData.title}`,
            content: `관련하여 고객 공지를 안내해드립니다.\n\n▶ 내용: ${incidentData.description}\n\n▶ 후속조치 안내 및 경과를 본 공지를 통해 업데이트 하겠습니다.`,
            is_published: false,
            author_id: user?.id
          }]);
          if (noticeErr) throw noticeErr;
        } catch (noticeErr: any) {
          console.error("Failed to auto draft notice:", noticeErr.message);
          alert("공지사항 자동 작성에 실패했습니다: " + noticeErr.message);
        }
      }

      setIsIncidentModalOpen(false);
      fetchData();
      alert("장애 리포트가 저장되었습니다.");
    } catch (err: any) {
      alert("저장 실패: " + err.message + "\n\nCS 관련 테이블이 존재하는지 확인바랍니다. (database_setup_cs.sql)");
    }
  };

  const handleSaveNotice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const noticeData = {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      is_published: formData.get("is_published") === "on",
      author_id: user?.id,
      updated_at: new Date().toISOString()
    };

    try {
      if (selectedNotice?.id) {
        const { error } = await supabase
          .from("cs_notices")
          .update(noticeData)
          .eq("id", selectedNotice.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("cs_notices")
          .insert([noticeData]);
        if (error) throw error;
      }
      setIsNoticeModalOpen(false);
      fetchData();
      alert("공지가 저장되었습니다.");
    } catch (err: any) {
      alert("저장 실패: " + err.message);
    }
  };

  const handleDeleteIncident = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("정말로 이 장애 리포트를 삭제하시겠습니까?")) return;
    
    try {
      const { error } = await supabase
        .from("cs_incidents")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      fetchData();
      alert("삭제되었습니다.");
    } catch (err: any) {
      alert("삭제 실패: " + err.message);
    }
  };

  const handleDeleteNotice = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("정말로 이 공지를 삭제하시겠습니까?")) return;
    
    try {
      const { error } = await supabase
        .from("cs_notices")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      fetchData();
      alert("삭제되었습니다.");
    } catch (err: any) {
      alert("삭제 실패: " + err.message);
    }
  };

  const toggleBusinessStatus = async (userId: string, currentStatus: string | undefined) => {
    try {
      const nextStatus = !currentStatus || currentStatus === 'active' ? 'dormant' : (currentStatus === 'dormant' ? 'closed' : 'active');
      
      const { error } = await supabase
        .from("profiles")
        .update({ business_status: nextStatus })
        .eq("id", userId);
      
      if (error) {
        throw error;
      }
      
      setUsers((prev) =>
        prev.map((p) =>
          p.id === userId ? { ...p, business_status: nextStatus } : p,
        ),
      );
    } catch (err: any) {
      alert("상태 변경 실패: " + err.message);
    }
  };

  if (!isAuthorized) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">권한 확인 중...</div>;
  }

  const downloadIncidentCsv = () => {
    const headers = ["장애 ID", "제목", "등급", "상태", "발생일시", "고객공지여부"];

    let filteredList = incidents.filter(i => 
      i.title?.toLowerCase().includes(incidentSearchTerm.toLowerCase()) || 
      i.id?.toLowerCase().includes(incidentSearchTerm.toLowerCase())
    );

    if (filterSeverity !== "all") {
      filteredList = filteredList.filter(i => i.severity.toString() === filterSeverity);
    }
    if (filterStatus !== "all") {
      filteredList = filteredList.filter(i => i.status === filterStatus);
    }

    filteredList.sort((a, b) => {
      let valA = a[incidentSortField] as any;
      let valB = b[incidentSortField] as any;
      
      if (incidentSortField === 'created_at') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return incidentSortOrder === "asc" ? -1 : 1;
      if (valA > valB) return incidentSortOrder === "asc" ? 1 : -1;
      return 0;
    });

    const csvContent = [
      headers.join(","),
      ...filteredList.map(i => [
        `"${i.id}"`,
        `"${i.title.replace(/"/g, '""')}"`,
        `"${i.severity}등급"`,
        `"${i.status === 'open' ? '대기' : i.status === 'investigating' ? '조사/조치중' : i.status === 'resolved' ? '해결됨' : '종료'}"`,
        `"${new Date(i.created_at).toLocaleString()}"`,
        `"${i.notify_customers ? '필요' : '-'}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `incident_list_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadCsv = () => {
    const headers = ["이름", "이메일", "크레딧 잔액", "구독 플랜", "영업 상태", "가입일"];
    
    // Using filtered and sorted users as defined in the UI
    let filteredList = users.filter(u => 
      u.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
      u.full_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.id?.toLowerCase().includes(userSearchTerm.toLowerCase())
    );

    if (filterSubscription === "active") {
      filteredList = filteredList.filter(u => !!u.subscription_plan);
    } else if (filterSubscription === "free") {
      filteredList = filteredList.filter(u => !u.subscription_plan);
    }

    if (filterBusinessStatus !== "all") {
      filteredList = filteredList.filter(u => {
        const status = !u.business_status ? 'active' : u.business_status;
        return status === filterBusinessStatus;
      });
    }
    
    // sorted 
    filteredList.sort((a, b) => {
      let valA = a[userSortField] as any;
      let valB = b[userSortField] as any;
      
      if (userSortField === 'created_at') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return userSortOrder === "asc" ? -1 : 1;
      if (valA > valB) return userSortOrder === "asc" ? 1 : -1;
      return 0;
    });

    const csvContent = [
      headers.join(","),
      ...filteredList
        .filter(u => !['admin', 'operator', 'security_admin', 'cs_admin', 'system_admin'].includes(u.role || ''))
        .map(u => [
        `"${u.full_name || ''}"`,
        `"${maskEmailForExport(u.email || '')}"`,
        `${u.credits || 0}`,
        `"${u.subscription_plan || '무료회원'}"`,
        `"${!u.business_status || u.business_status === 'active' ? '정상영업' : u.business_status === 'dormant' ? '장기미사용(휴면)' : '휴/폐업'}"`,
        `"${new Date(u.created_at).toLocaleDateString()}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `user_list_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadNoticeCsv = () => {
    const headers = ["공지 제목", "게시 상태", "생성일", "설명"];
    const csvContent = [
      headers.join(","),
      ...notices.map(n => [
        `"${n.title.replace(/"/g, '""')}"`,
        `"${n.is_published ? '게시중' : '비공개'}"`,
        `"${new Date(n.created_at).toLocaleString()}"`,
        `"${(n.content || '').substring(0, 50).replace(/"/g, '""')}..."`
      ].join(","))
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `notice_list_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const SEVERITY_COLORS = ['#000000', '#dc2626', '#ea580c', '#ca8a04', '#2563eb'];
  const STATUS_COLORS = {
    open: '#6b7280',
    investigating: '#2563eb',
    resolved: '#16a34a',
    closed: '#9333ea'
  };

  const severityData = [1, 2, 3, 4].map(level => ({
    name: `${level}등급`,
    value: incidents.filter(i => i.severity === level).length,
    fill: SEVERITY_COLORS[level]
  }));

  const severityStatusData = [1, 2, 3, 4].map(level => {
    const levelIncidents = incidents.filter(i => i.severity === level);
    return {
      name: `${level}등급`,
      open: levelIncidents.filter(i => i.status === 'open').length,
      investigating: levelIncidents.filter(i => i.status === 'investigating').length,
      resolved: levelIncidents.filter(i => i.status === 'resolved').length,
      closed: levelIncidents.filter(i => i.status === 'closed').length,
      total: levelIncidents.length
    };
  });

  const statusData = [
    { key: 'open', name: '등록/대기', fill: STATUS_COLORS.open },
    { key: 'investigating', name: '조사/조치중', fill: STATUS_COLORS.investigating },
    { key: 'resolved', name: '해결됨', fill: STATUS_COLORS.resolved },
    { key: 'closed', name: '종료', fill: STATUS_COLORS.closed }
  ].map(s => ({ ...s, count: incidents.filter(i => i.status === s.key).length }));

  const getSeverityBadge = (severity: number) => {
    switch (severity) {
      case 1: return <span className="px-2 py-1 text-xs font-bold rounded-md bg-red-100 text-red-700">1등급 (Critical)</span>;
      case 2: return <span className="px-2 py-1 text-xs font-bold rounded-md bg-orange-100 text-orange-700">2등급 (High)</span>;
      case 3: return <span className="px-2 py-1 text-xs font-bold rounded-md bg-yellow-100 text-yellow-700">3등급 (Medium)</span>;
      case 4: return <span className="px-2 py-1 text-xs font-bold rounded-md bg-blue-100 text-blue-700">4등급 (Low)</span>;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <span className="px-2 py-1 text-xs font-bold rounded-md bg-gray-100 text-gray-700">등록/대기</span>;
      case 'investigating': return <span className="px-2 py-1 text-xs font-bold rounded-md bg-blue-100 text-blue-700">조사/조치중</span>;
      case 'resolved': return <span className="px-2 py-1 text-xs font-bold rounded-md bg-green-100 text-green-700">해결됨</span>;
      case 'closed': return <span className="px-2 py-1 text-xs font-bold rounded-md bg-purple-100 text-purple-700">종료</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col pt-20 flex-shrink-0 z-50 transition-transform duration-300 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}>
        <div className="md:hidden absolute top-[18px] right-4 z-50">
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="px-6 py-6 border-b border-gray-100 mb-4 mt-12 md:mt-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tight">
              CS Admin
            </span>
          </div>
          <p className="text-xs text-gray-500 pl-10 font-medium tracking-wider">ISO/IEC 27001 ISMS-P</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-2 pb-24">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === "dashboard" ? "bg-red-50 text-red-600" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            대시보드
          </button>
          <button
            onClick={() => setActiveTab("incidents")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === "incidents" ? "bg-red-50 text-red-600" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <AlertTriangle className="w-5 h-5" />
            장애 관리 (SLA)
          </button>
          <button
            onClick={() => setActiveTab("chats")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === "chats" ? "bg-red-50 text-red-600" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <MessageCircle className="w-5 h-5" />
            실시간 채팅 상담
          </button>
          <button
            onClick={() => setActiveTab("chatbot")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === "chatbot" ? "bg-red-50 text-red-600" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <MessageCircle className="w-5 h-5" />
            챗봇 시나리오 관리
          </button>
          <button
            onClick={() => setActiveTab("notices")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === "notices" ? "bg-red-50 text-red-600" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <Megaphone className="w-5 h-5" />
            고객 공지 관리
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === "users" ? "bg-red-50 text-red-600" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <Users className="w-5 h-5" />
            통합 회원 조회
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            <LogOut className="w-5 h-5" /> 사이트로 돌아가기
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pt-20 md:pt-24 pb-12 px-4 md:px-8 xl:px-12 ml-0 overflow-y-auto h-screen bg-gray-50/50 relative w-full">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            {/* Mobile Header Toggle */}
            <div className="md:hidden mb-6 mt-4 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <span className="font-bold text-gray-900">CS Admin</span>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {/* Dashboard Tab */}
              {activeTab === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
                    <div>
                      <h1 className="text-3xl font-black text-gray-900 mb-2">CS 대시보드</h1>
                      <p className="text-gray-500 mb-0 font-medium">고객 서비스 및 장애 관리 현황을 한눈에 파악합니다.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">조치중인 장애</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {incidents.filter(i => i.status === 'open' || i.status === 'investigating').length}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Megaphone className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">활성 공지</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {notices.filter(n => n.is_published).length}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 md:col-span-2">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">총 회원</p>
                        <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                      </div>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Status Chart */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">처리 현황</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={statusData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                            <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={60}>
                              {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Severity Chart */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">등급별 처리 상태</h3>
                      <div className="h-64">
                        {severityStatusData.filter(d => d.total > 0).length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
                            <p>등록된 게시물이 없습니다.</p>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={severityStatusData.filter(d => d.total > 0)} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                              <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                              <Legend wrapperStyle={{ fontSize: '12px' }} />
                              <Bar dataKey="open" stackId="a" name="등록/대기" fill={STATUS_COLORS.open} />
                              <Bar dataKey="investigating" stackId="a" name="조사/조치중" fill={STATUS_COLORS.investigating} />
                              <Bar dataKey="resolved" stackId="a" name="해결됨" fill={STATUS_COLORS.resolved} />
                              <Bar dataKey="closed" stackId="a" name="종료" fill={STATUS_COLORS.closed} radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ISMS-P Guidelines snippet */}
                  <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <ShieldAlert className="w-5 h-5 text-brand-primary" />
                      <h3 className="text-lg font-bold">장애 대응 및 보고 체계 (ISMS-P 2.9/2.12 참조)</h3>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-300">
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">•</span>
                        <span><strong>1등급 (Critical):</strong> 전면 장애, 핵심 서비스 중단. 발견 즉시 CISO 및 경영진 보고, 1시간 내 1차 고객 공지 의무.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-400 mt-0.5">•</span>
                        <span><strong>2등급 (High):</strong> 주요 기능 장애 (결제 등). 2시간 내 해결 불가 시 공지, SLA 기준에 따른 보상 검토.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-0.5">•</span>
                        <span><strong>3등급 (Medium):</strong> 일부 사용자 영향 또는 중요도 낮은 기능 장애. 일일 보고 포함.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">•</span>
                        <span><strong>4등급 (Low):</strong> 성능 저하 등 사소한 인시던트. 주간/월간 검토안 반영.</span>
                      </li>
                      <li className="flex items-start gap-2 mt-4 pt-4 border-t border-slate-700">
                        <span className="text-green-400 mt-0.5">※</span>
                        <span>모든 장애는 <strong>해결(Resolved) 후 48시간 내에 [근본 원인 분석] 및 [재발 방지 대책]</strong>을 등재하여야 합니다.</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              )}

              {/* Chats Tab */}
              {activeTab === "chats" && (
                <motion.div
                  key="chats"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full flex flex-col"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                    <div>
                      <h1 className="text-3xl font-black text-gray-900 mb-2">실시간 채팅 상담</h1>
                      <p className="text-gray-500 mb-0 font-medium">고객과 실시간으로 대화하고 문의사항을 해결합니다.</p>
                    </div>
                  </div>
                  <LiveChatAdmin adminUser={user} />
                </motion.div>
              )}

              {/* Chatbot Scenario Tab */}
              {activeTab === "chatbot" && (
                <motion.div
                  key="chatbot"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full flex flex-col"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                    <div>
                      <h1 className="text-3xl font-black text-gray-900 mb-2">챗봇 시나리오 관리</h1>
                      <p className="text-gray-500 mb-0 font-medium">고객이 챗봇과 대화 시 거치는 단계별 예상 질문 지문을 편집합니다.</p>
                    </div>
                  </div>
                  <ChatbotEditor />
                </motion.div>
              )}

              {/* Incidents Tab */}
              {activeTab === "incidents" && (
                <motion.div
                  key="incidents"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
                    <div>
                      <h1 className="text-3xl font-black text-gray-900 mb-2">장애 관리 (SLA)</h1>
                      <p className="text-gray-500 mb-0 font-medium">기술적 결함, 시스템 장애 발생 및 처리 현황을 로깅합니다.</p>
                    </div>
                    <div className="flex items-center gap-3 justify-end shrink-0">
                      <button onClick={downloadIncidentCsv} className="px-3 py-2 bg-green-50 text-green-700 font-bold rounded-xl text-sm border-2 border-green-100 hover:bg-green-100 transition-colors">
                        Excel 다운로드
                      </button>
                      <button onClick={handlePrint} className="px-3 py-2 bg-gray-50 text-gray-700 font-bold rounded-xl text-sm border-2 border-gray-100 hover:bg-gray-100 transition-colors">
                        프린트
                      </button>
                      <button
                        onClick={() => {
                          setSelectedIncident(null);
                          setIsIncidentModalOpen(true);
                        }}
                        className="bg-brand-primary text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-primary/90 transition-all shadow-md shadow-brand-primary/20 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        신규 등록
                      </button>
                    </div>
                  </div>

                  {/* Incidents Summary Dashboard */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-center">
                      <p className="text-xs font-bold text-gray-500 mb-1">진행중인 장애</p>
                      <p className="text-2xl font-black text-brand-primary">
                        {incidents.filter(i => i.status === 'open' || i.status === 'investigating').length}건
                      </p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-center">
                      <p className="text-xs font-bold text-gray-500 mb-1">상태 현황</p>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-500 font-medium">대기 <b className="text-gray-900">{incidents.filter(i => i.status === 'open').length}</b></span>
                        <span className="text-blue-500 font-medium">조사중 <b className="text-blue-700">{incidents.filter(i => i.status === 'investigating').length}</b></span>
                        <span className="text-green-500 font-medium">해결 <b className="text-green-700">{incidents.filter(i => i.status === 'resolved').length}</b></span>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-center sm:col-span-2">
                       <p className="text-xs font-bold text-gray-500 mb-1">등급별 발생 현황</p>
                       <div className="flex items-center justify-between gap-4 text-sm mt-1">
                          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-600"></div> <span className="font-bold text-red-600">1등급</span> {incidents.filter(i => i.severity === 1).length}건</div>
                          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500"></div> <span className="font-bold text-orange-600">2등급</span> {incidents.filter(i => i.severity === 2).length}건</div>
                          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> <span className="font-bold text-yellow-600">3등급</span> {incidents.filter(i => i.severity === 3).length}건</div>
                          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> <span className="font-bold text-blue-600">4등급</span> {incidents.filter(i => i.severity === 4).length}건</div>
                       </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-4 items-center">
                      <div className="flex-1 flex items-center gap-3 bg-white px-3 py-2 rounded-xl border border-gray-200 w-full">
                        <Search className="w-5 h-5 text-gray-400" />
                        <input 
                          type="text" 
                          placeholder="제목 또는 장애 ID로 검색..." 
                          className="bg-transparent border-none focus:outline-none w-full text-sm"
                          value={incidentSearchTerm}
                          onChange={(e) => setIncidentSearchTerm(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <select 
                          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none"
                          value={filterSeverity}
                          onChange={(e) => setFilterSeverity(e.target.value as any)}
                        >
                          <option value="all">모든 등급</option>
                          <option value="1">1등급</option>
                          <option value="2">2등급</option>
                          <option value="3">3등급</option>
                          <option value="4">4등급</option>
                        </select>
                        <select 
                          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none"
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value as any)}
                        >
                          <option value="all">모든 상태</option>
                          <option value="open">대기</option>
                          <option value="investigating">조사중</option>
                          <option value="resolved">해결됨</option>
                          <option value="closed">종료</option>
                        </select>
                        <select 
                          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none"
                          value={incidentSortField}
                          onChange={(e) => setIncidentSortField(e.target.value as any)}
                        >
                          <option value="created_at">발생일 기준</option>
                          <option value="severity">등급 기준</option>
                        </select>
                        <button 
                          className="p-2 border border-gray-200 rounded-xl bg-white focus:outline-none text-gray-500 hover:text-gray-900"
                          title="정렬 순서"
                          onClick={() => setIncidentSortOrder(incidentSortOrder === "asc" ? "desc" : "asc")}
                        >
                          {incidentSortOrder === "asc" ? "↑" : "↓"}
                        </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto print:max-h-full print:overflow-visible">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr className="border-b border-gray-100 text-gray-500 text-sm font-medium">
                            <th className="p-4 py-3 whitespace-nowrap">티켓 번호</th>
                            <th className="p-4 py-3 whitespace-nowrap">등급</th>
                            <th className="p-4 py-3 whitespace-nowrap">제목</th>
                            <th className="p-4 py-3 whitespace-nowrap">상태</th>
                            <th className="p-4 py-3 whitespace-nowrap">발생 일시</th>
                            <th className="p-4 py-3 whitespace-nowrap">SLA 기한</th>
                            <th className="p-4 py-3 text-center whitespace-nowrap print:hidden">관리</th>
                          </tr>
                        </thead>
                        <tbody>
                          {incidents
                            .filter(i => 
                              i.title?.toLowerCase().includes(incidentSearchTerm.toLowerCase()) || 
                              i.id?.toLowerCase().includes(incidentSearchTerm.toLowerCase())
                            )
                            .filter(i => {
                              if (filterSeverity === 'all') return true;
                              return i.severity.toString() === filterSeverity;
                            })
                            .filter(i => {
                              if (filterStatus === 'all') return true;
                              return i.status === filterStatus;
                            })
                            .sort((a, b) => {
                              let valA = a[incidentSortField] as any;
                              let valB = b[incidentSortField] as any;
                              
                              if (incidentSortField === 'created_at') {
                                valA = new Date(valA).getTime();
                                valB = new Date(valB).getTime();
                              }
                        
                              if (valA < valB) return incidentSortOrder === "asc" ? -1 : 1;
                              if (valA > valB) return incidentSortOrder === "asc" ? 1 : -1;
                              return 0;
                            })
                            .length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-gray-400">등록된 장애 인시던트가 없습니다.</td>
                            </tr>
                          ) : (
                            incidents
                            .filter(i => 
                              i.title?.toLowerCase().includes(incidentSearchTerm.toLowerCase()) || 
                              i.id?.toLowerCase().includes(incidentSearchTerm.toLowerCase())
                            )
                            .filter(i => {
                              if (filterSeverity === 'all') return true;
                              return i.severity.toString() === filterSeverity;
                            })
                            .filter(i => {
                              if (filterStatus === 'all') return true;
                              return i.status === filterStatus;
                            })
                            .sort((a, b) => {
                              let valA = a[incidentSortField] as any;
                              let valB = b[incidentSortField] as any;
                              
                              if (incidentSortField === 'created_at') {
                                valA = new Date(valA).getTime();
                                valB = new Date(valB).getTime();
                              }
                        
                              if (valA < valB) return incidentSortOrder === "asc" ? -1 : 1;
                              if (valA > valB) return incidentSortOrder === "asc" ? 1 : -1;
                              return 0;
                            })
                            .map((inc) => (
                              <tr key={inc.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                <td className="p-4 text-xs font-mono text-gray-500">{inc.id.substring(0, 8)}</td>
                                <td className="p-4">{getSeverityBadge(inc.severity)}</td>
                                <td className="p-4 font-medium text-gray-900 max-w-xs truncate">{inc.title}</td>
                                <td className="p-4">{getStatusBadge(inc.status)}</td>
                                <td className="p-4 text-sm text-gray-500">{new Date(inc.created_at).toLocaleString()}</td>
                                <td className="p-4 text-sm font-mono whitespace-nowrap">
                                  {inc.sla_deadline ? (
                                    new Date(inc.sla_deadline) < new Date() && inc.status !== 'closed' && inc.status !== 'resolved' ? (
                                      <span className="text-red-500 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> {new Date(inc.sla_deadline).toLocaleString()}</span>
                                    ) : (
                                      new Date(inc.sla_deadline).toLocaleString()
                                    )
                                  ) : "-"}
                                </td>
                                <td className="p-4 flex items-center justify-center gap-2 print:hidden">
                                  <button
                                    onClick={() => {
                                      setSelectedIncident(inc);
                                      setIsIncidentModalOpen(true);
                                    }}
                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteIncident(inc.id, e)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Notices Tab */}
              {activeTab === "notices" && (
                <motion.div
                  key="notices"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
                    <div>
                      <h1 className="text-3xl font-black text-gray-900 mb-2">고객 공지 관리</h1>
                      <p className="text-gray-500 mb-0 font-medium">장애, 시스템 점검 등 사용자를 위한 공지사항을 등록/수정합니다.</p>
                    </div>
                    <div className="flex items-center gap-3 justify-end shrink-0">
                      <button onClick={downloadNoticeCsv} className="px-3 py-2 bg-green-50 text-green-700 font-bold rounded-xl text-sm border-2 border-green-100 hover:bg-green-100 transition-colors">
                        Excel 다운로드
                      </button>
                      <button onClick={handlePrint} className="px-3 py-2 bg-gray-50 text-gray-700 font-bold rounded-xl text-sm border-2 border-gray-100 hover:bg-gray-100 transition-colors">
                        프린트
                      </button>
                      <button
                        onClick={() => {
                          setSelectedNotice(null);
                          setIsNoticeModalOpen(true);
                        }}
                        className="bg-brand-primary text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-primary/90 transition-all shadow-md shadow-brand-primary/20 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        새 공지사항 등록
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {notices.length === 0 ? (
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
                        등록된 공지사항이 없습니다.
                      </div>
                    ) : (
                      notices.map((notice) => (
                        <div key={notice.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {notice.is_published ? (
                                <span className="px-2 py-0.5 text-xs font-bold rounded bg-green-100 text-green-700">게시중</span>
                              ) : (
                                <span className="px-2 py-0.5 text-xs font-bold rounded bg-gray-100 text-gray-600">임시저장</span>
                              )}
                              <h3 className="font-bold text-lg text-gray-900">{notice.title}</h3>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2 mt-2">{notice.content}</p>
                            <div className="text-xs text-gray-400 mt-4 flex items-center gap-4">
                              <span>작성일: {new Date(notice.created_at).toLocaleString()}</span>
                              <span>수정일: {new Date(notice.updated_at).toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="shrink-0 flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedNotice(notice);
                                setIsNoticeModalOpen(true);
                              }}
                              className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteNotice(notice.id, e)}
                              className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {/* Users Tab */}
              {activeTab === "users" && (
                <motion.div
                  key="users"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
                    <div>
                      <h1 className="text-3xl font-black text-gray-900 mb-2">통합 회원 조회</h1>
                      <p className="text-gray-500 mb-0 font-medium">통합 가입자 정보를 조회하고 가입 상태를 변경합니다.</p>
                    </div>
                    <div className="flex items-center gap-3 justify-end shrink-0">
                       <button onClick={downloadCsv} className="px-3 py-2 bg-green-50 text-green-700 font-bold rounded-xl text-sm border-2 border-green-100 hover:bg-green-100 transition-colors">
                         Excel 다운로드
                       </button>
                       <button onClick={handlePrint} className="px-3 py-2 bg-gray-50 text-gray-700 font-bold rounded-xl text-sm border-2 border-gray-100 hover:bg-gray-100 transition-colors">
                         프린트
                       </button>
                    </div>
                  </div>
                  
                  {/* Business Status Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-gray-500 mb-1">정상 영업중</p>
                        <p className="text-2xl font-black text-gray-900">
                          {users.filter(u => !u.business_status || u.business_status === 'active').length}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                        <Activity className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-gray-500 mb-1">장기 미사용 (휴면)</p>
                        <p className="text-2xl font-black text-orange-600">
                          {users.filter(u => u.business_status === 'dormant').length}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-gray-500 mb-1">휴·폐업 계정</p>
                        <p className="text-2xl font-black text-red-600">
                          {users.filter(u => u.business_status === 'closed').length}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                        <X className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-4 items-center">
                      <div className="flex-1 flex items-center gap-3 bg-white px-3 py-2 rounded-xl border border-gray-200 w-full">
                        <Search className="w-5 h-5 text-gray-400" />
                        <input 
                          type="text" 
                          placeholder="이메일, 이름, 또는 ID로 검색..." 
                          className="bg-transparent border-none focus:outline-none w-full text-sm"
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <select 
                          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none"
                          value={filterSubscription}
                          onChange={(e) => setFilterSubscription(e.target.value as any)}
                        >
                          <option value="all">모든 구독</option>
                          <option value="active">유료구독</option>
                          <option value="free">무료회원</option>
                        </select>
                        <select 
                          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none"
                          value={filterBusinessStatus}
                          onChange={(e) => setFilterBusinessStatus(e.target.value as any)}
                        >
                          <option value="all">모든 상태</option>
                          <option value="active">정상영업</option>
                          <option value="dormant">휴면</option>
                          <option value="closed">휴/폐업</option>
                        </select>
                        <select 
                          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none"
                          value={userSortField}
                          onChange={(e) => setUserSortField(e.target.value as any)}
                        >
                          <option value="created_at">가입일 기준</option>
                          <option value="credits">크레딧 기준</option>
                        </select>
                        <button 
                          className="p-2 border border-gray-200 rounded-xl bg-white focus:outline-none text-gray-500 hover:text-gray-900"
                          title="정렬 순서"
                          onClick={() => setUserSortOrder(userSortOrder === "asc" ? "desc" : "asc")}
                        >
                          {userSortOrder === "asc" ? "↑" : "↓"}
                        </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto print:max-h-full print:overflow-visible">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr className="border-b border-gray-100 text-gray-500 text-sm font-medium">
                            <th className="p-4 py-3 whitespace-nowrap">이름</th>
                            <th className="p-4 py-3 whitespace-nowrap">이메일</th>
                            <th className="p-4 py-3 whitespace-nowrap">크레딧 잔액</th>
                            <th className="p-4 py-3 whitespace-nowrap">구독 플랜</th>
                            <th className="p-4 py-3 whitespace-nowrap">영업 상태</th>
                            <th className="p-4 py-3 whitespace-nowrap">가입일</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users
                            .filter(u => 
                              u.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
                              u.full_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                              u.id?.toLowerCase().includes(userSearchTerm.toLowerCase())
                            )
                            .filter(u => {
                              if (filterSubscription === 'active') return !!u.subscription_plan;
                              if (filterSubscription === 'free') return !u.subscription_plan;
                              return true;
                            })
                            .filter(u => {
                              if (filterBusinessStatus === 'all') return true;
                              const s = !u.business_status ? 'active' : u.business_status;
                              return s === filterBusinessStatus;
                            })
                            .sort((a, b) => {
                              let valA = a[userSortField] as any;
                              let valB = b[userSortField] as any;
                              
                              if (userSortField === 'created_at') {
                                valA = new Date(valA).getTime();
                                valB = new Date(valB).getTime();
                              }
                        
                              if (valA < valB) return userSortOrder === "asc" ? -1 : 1;
                              if (valA > valB) return userSortOrder === "asc" ? 1 : -1;
                              return 0;
                            })
                            .map((u) => (
                              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-sm">
                                <td className="p-4 font-medium text-gray-900">
                                  {u.full_name || '-'}
                                  <div className="text-[10px] text-gray-400 font-mono hidden sm:block">{u.id}</div>
                                </td>
                                <td className="p-4 text-gray-600">{u.email}</td>
                                <td className="p-4 font-bold text-brand-primary">{u.credits} C</td>
                                <td className="p-4">
                                  {u.subscription_plan ? (
                                    <span className="px-2 py-1 text-xs font-bold rounded-md bg-indigo-50 text-indigo-700">
                                      {u.subscription_plan}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">무료회원</span>
                                  )}
                                </td>
                                <td className="p-4">
                                  <button
                                    onClick={() => toggleBusinessStatus(u.id, u.business_status)}
                                    className={`text-xs px-2.5 py-1 rounded-md font-bold transition-colors ${
                                      !u.business_status || u.business_status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                                      u.business_status === 'dormant' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' :
                                      'bg-red-100 text-red-700 hover:bg-red-200'
                                    }`}
                                    title="상태 변경 (영업중 -> 미사용/휴면 -> 폐업)"
                                  >
                                    {!u.business_status || u.business_status === 'active' ? '정상영업' :
                                     u.business_status === 'dormant' ? '휴면' :
                                     '휴/폐업'}
                                  </button>
                                </td>
                                <td className="p-4 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                              </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Incident Modal */}
      {isIncidentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-3xl my-auto shadow-2xl overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">
                {selectedIncident ? "장애 / 인시던트 수정" : "신규 장애 / 인시던트 등록"}
              </h3>
              <button onClick={() => setIsIncidentModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 bg-white rounded-full shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveIncident} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">장애명 (제목) *</label>
                  <input required name="title" defaultValue={selectedIncident?.title} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary/50 focus:outline-none" placeholder="예: 결제 시스템 일시적 타임아웃 오류 발생" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">장애 등급 * (ISMS-P 기준)</label>
                  <select required name="severity" defaultValue={selectedIncident?.severity || 3} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary/50 focus:outline-none">
                    <option value={1}>1등급 (Critical - 전면장애)</option>
                    <option value={2}>2등급 (High - 주요기능 장애)</option>
                    <option value={3}>3등급 (Medium - 일부 기능/사용자 장애)</option>
                    <option value={4}>4등급 (Low - 단순 오류/지연)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">현재 상태 *</label>
                  <select required name="status" defaultValue={selectedIncident?.status || 'open'} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary/50 focus:outline-none">
                    <option value="open">등록 / 대기 (Open)</option>
                    <option value="investigating">조사 / 조치중 (Investigating)</option>
                    <option value="resolved">조치 완료 (Resolved)</option>
                    <option value="closed">종료 / 사후보고 완료 (Closed)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">SLA 기한 (조치 목표 일시)</label>
                  <input type="datetime-local" name="sla_deadline" defaultValue={selectedIncident?.sla_deadline ? new Date(new Date(selectedIncident.sla_deadline).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary/50 focus:outline-none" />
                  <p className="text-xs text-gray-500 mt-1">1등급/2등급 장애의 경우 내부 규정에 따른 기한을 설정하세요.</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">상세 내역 (증상 및 타임라인)</label>
                  <textarea name="description" defaultValue={selectedIncident?.description} rows={4} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary/50 focus:outline-none" placeholder="인지 일시, 주요 증상, 임시 조치 사항 등 기록"></textarea>
                </div>

                <div className="md:col-span-2 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                  <label className="block text-sm font-bold text-indigo-900 mb-2">근본 원인 분석 (Root Cause Analysis)</label>
                  <textarea name="root_cause" defaultValue={selectedIncident?.root_cause} rows={3} className="w-full bg-white border border-indigo-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary/50 focus:outline-none" placeholder="해결 후 48시간 내 작성 필. 왜 장애가 발생했는가?"></textarea>
                </div>

                <div className="md:col-span-2 bg-green-50/50 p-4 rounded-2xl border border-green-100">
                  <label className="block text-sm font-bold text-green-900 mb-2">재발 방지 대책 (Prevention Plan)</label>
                  <textarea name="prevention_plan" defaultValue={selectedIncident?.prevention_plan} rows={3} className="w-full bg-white border border-green-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500/50 focus:outline-none" placeholder="향후 동일 장애를 막기 위한 기술적/관리적 대책"></textarea>
                </div>

                <div className="md:col-span-2 flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <input type="checkbox" id="notify_customers" name="notify_customers" defaultChecked={selectedIncident?.notify_customers} className="w-5 h-5 rounded text-brand-primary focus:ring-brand-primary" />
                  <label htmlFor="notify_customers" className="text-sm font-medium text-gray-800 cursor-pointer">고객 공지 필요 대상 (체크 시 공지사항 관리 탭과 연동/이력 추적 용이)</label>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsIncidentModalOpen(false)} className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">취소</button>
                <button type="submit" className="flex-1 py-3.5 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/20">저장 및 보고</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Notice Modal */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-3xl my-auto shadow-2xl overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">
                {selectedNotice ? "공지사항 수정" : "새 공지사항 작성"}
              </h3>
              <button onClick={() => setIsNoticeModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 bg-white rounded-full shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveNotice} className="p-6">
              <div className="space-y-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">공지 제목 *</label>
                  <input required name="title" defaultValue={selectedNotice?.title} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary/50 focus:outline-none" placeholder="제목을 입력하세요" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">공지 내용 *</label>
                  <textarea required name="content" defaultValue={selectedNotice?.content} rows={12} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary/50 focus:outline-none" placeholder="내용을 입력하세요 (장애 공지인 경우, 발생 원인 및 조치 상황, 예상 복구시간 등을 명시하세요)"></textarea>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                   <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                      <input type="checkbox" name="is_published" id="is_published" defaultChecked={selectedNotice?.is_published} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-6 checked:border-brand-primary" />
                      <label htmlFor="is_published" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                   </div>
                   <label htmlFor="is_published" className="text-sm font-bold text-gray-800 cursor-pointer">즉시 게시 (사이트에 고객 공지 노출)</label>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsNoticeModalOpen(false)} className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">취소</button>
                <button type="submit" className="flex-1 py-3.5 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/20">저장</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
