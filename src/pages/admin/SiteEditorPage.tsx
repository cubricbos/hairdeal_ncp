import React, { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Layout, ArrowLeft } from "lucide-react";
import SiteEditor from "../../components/admin/SiteEditor";

export default function SiteEditorPage({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const isAdmin = user?.email === "cubric.ceo@gmail.com";

  useEffect(() => {
    if (user && !isAdmin) {
      navigate("/");
    }
    if (!user) {
      // Allow some time for auth to initialize
      const timer = setTimeout(() => {
        if (!user) navigate("/");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, isAdmin, navigate]);

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col h-screen overflow-hidden">
      {/* Sub Header for Site Editor Mode */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            관리 홈으로
          </button>
          <div className="h-4 w-[1px] bg-gray-200" />
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-black text-emerald-700">홈페이지 편집 모드</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-1.5 text-xs font-black text-white bg-gray-900 hover:bg-gray-800 rounded-full transition-all shadow-sm"
          >
            사이트 전체보기
          </button>
        </div>
      </header>

      {/* Main Content Area - SiteEditor takes over the layout */}
      <main className="flex-1 overflow-y-auto px-6 py-8 sm:px-10">
        <div className="max-w-7xl mx-auto">
          <SiteEditor />
        </div>
      </main>
    </div>
  );
}
