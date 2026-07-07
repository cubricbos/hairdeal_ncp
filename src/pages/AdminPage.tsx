import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  CreditCard,
  Activity,
  DollarSign,
  Store,
  Clock,
  ChevronRight,
  LogOut,
  MessageSquare,
  Camera,
  Trash2,
  Plus,
  Edit2,
  Upload,
  X,
  CheckSquare,
  Square,
  GripVertical,
  Globe,
  ToggleLeft,
  ToggleRight,
  Monitor,
  Layout,
  Coins,
  Settings,
  History,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  Shield,
  Lock,
  Menu,
  MapPin,
  UserCircle,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import SiteEditor from "../components/admin/SiteEditor";
import { GeminiApiKeyManager } from "../components/admin/GeminiApiKeyManager";
import { useSiteContext } from "../context/SiteContext";
import { accountClient, apiClient } from "../lib/ncpClient";
import { logPrivacyAction } from "../lib/auditLogger";
import axios from "axios";

interface Inquiry {
  id: string;
  salon_name: string;
  contact_name: string;
  phone: string;
  email: string;
  details: string;
  status: string;
  created_at: string;
}

interface AiModel {
  id: string;
  gender: "female" | "male";
  description: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
  sort_order?: number;
}

interface VisitorLog {
  id: string;
  ip_address: string;
  location: string;
  latitude?: number;
  longitude?: number;
  user_agent: string;
  referrer: string;
  visited_at: string;
}

interface SortableModelCardProps {
  key?: string | number;
  model: AiModel;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onEditClick: (model: AiModel) => void;
  onDeleteClick: (model: AiModel) => void;
}

const SortableModelCard = ({
  model,
  isSelected,
  onToggleSelect,
  onEditClick,
  onDeleteClick,
}: SortableModelCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: model.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-2xl overflow-hidden shadow-sm border group relative ${isSelected ? "border-brand-primary ring-2 ring-brand-primary/20" : "border-gray-100"}`}
    >
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(model.id);
          }}
          className="text-white hover:scale-110 transition-transform bg-black/20 rounded-md p-1 backdrop-blur-sm"
        >
          {isSelected ? (
            <CheckSquare className="w-5 h-5 text-brand-primary bg-white rounded-sm drop-shadow-md" />
          ) : (
            <Square className="w-5 h-5 drop-shadow-md" />
          )}
        </button>
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-white bg-black/20 rounded-md p-1 backdrop-blur-sm hover:bg-black/40 transition-colors"
        >
          <GripVertical className="w-5 h-5 drop-shadow-md" />
        </div>
      </div>

      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={model.image_url || undefined}
          alt={model.description}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-3 left-3 pointer-events-none">
          <span
            className={`text-[10px] font-bold px-2 py-1 rounded-md shadow-sm border ${model.gender === "female" ? "bg-pink-50 text-pink-600 border-pink-100" : "bg-blue-50 text-blue-600 border-blue-100"}`}
          >
            {model.gender === "female" ? "여성 모델" : "남성 모델"}
          </span>
        </div>
              <div className="absolute top-3 right-3 flex gap-1.5 opacity-100 transition-opacity z-20">
                <button
                  onClick={() => onEditClick(model)}
                  className="p-2 bg-white/95 text-indigo-600 rounded-full shadow-sm hover:bg-indigo-50 border border-gray-100 transition-colors"
                  title="수정"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteClick(model)}
                  className="p-2 bg-white/95 text-red-500 rounded-full shadow-sm hover:bg-red-50 border border-gray-100 transition-colors"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
      </div>
      <div className="p-4">
        <p className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight">
          {model.description || "설명 없음"}
        </p>
        <p
          className="text-xs text-gray-400 mt-2 truncate"
          title={model.image_url}
        >
          {model.image_url}
        </p>
      </div>
    </div>
  );
};

// Helper to mask email for privacy in exports
const maskEmailForExport = (email: string) => {
  if (!email || !email.includes('@')) return email || '';
  const [id, domain] = email.split('@');
  if (id.length <= 3) {
    return id + '@' + domain;
  }
  return id.substring(0, 3) + '*'.repeat(id.length - 3) + '@' + domain;
};

export default function AdminPage({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isAdmin = (user?.email === "cubric.ceo@gmail.com") || (localStorage.getItem('ncp_admin') === 'true');

  const handleLogout = async () => {
    try {
      // Trigger sign out from Supabase as non-blocking background task to prevent hanging network calls from delaying UI clearing
      supabase.auth.signOut().catch(() => {});
    } catch (e) {
      console.warn("Supabase auth signOut error", e);
    }
    localStorage.removeItem('ncp_access_token');
    localStorage.removeItem('ncp_refresh_token');
    localStorage.removeItem('ncp_admin');
    localStorage.clear();
    sessionStorage.clear();
    
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    window.dispatchEvent(new Event('ncp_auth_changed'));
    
    setTimeout(() => {
      window.location.replace(window.location.origin + '/?logout=' + Date.now());
    }, 100);
  };
  
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  const { settings: siteSettings, updateSettings } = useSiteContext();
  const [facefusionUrl, setFacefusionUrl] = useState(siteSettings?.integrations?.facefusionUrl || "");
  const [integrationTab, setIntegrationTab] = useState<"aistudio" | "gemini">("aistudio");
  const [savingSettings, setSavingSettings] = useState(false);
  
  // Keep integration URLs in sync if it loads later
  useEffect(() => {
    if (siteSettings?.integrations?.facefusionUrl) {
      setFacefusionUrl(siteSettings.integrations.facefusionUrl);
    }
  }, [siteSettings]);

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [aiModels, setAiModels] = useState<AiModel[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [userProvidersMap, setUserProvidersMap] = useState<Record<string, string>>({});
  const [userEmailsMap, setUserEmailsMap] = useState<Record<string, string>>({});
  const [userPhonesMap, setUserPhonesMap] = useState<Record<string, string>>({});
  const [hasCreditsColumn, setHasCreditsColumn] = useState(true);
  const [hairStyles, setHairStyles] = useState<
    {
      id: string;
      name: string;
      gender: "female" | "male";
      sort_order: number;
    }[]
  >([]);
  const [newHairStyleName, setNewHairStyleName] = useState("");
  const [newHairStyleGender, setNewHairStyleGender] = useState<
    "female" | "male"
  >("female");
  const [editingStyleId, setEditingStyleId] = useState<string | null>(null);

  const [totalUsers, setTotalUsers] = useState(0);
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>([]);
  const [selectedMapLog, setSelectedMapLog] = useState<VisitorLog | null>(null);
  const [preventDuplicateIp, setPreventDuplicateIp] = useState(true);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form states for new AI Model
  const [newModelGender, setNewModelGender] = useState<"female" | "male">(
    "female",
  );
  const [newModelDesc, setNewModelDesc] = useState("");
  const [newModelUrl, setNewModelUrl] = useState("");
  const [newModelFile, setNewModelFile] = useState<File | null>(null);
  const [isSubmittingModel, setIsSubmittingModel] = useState(false);
  const [filterGender, setFilterGender] = useState<"all" | "female" | "male">(
    "all",
  );
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);

  // Credits Management
  const [dailyCreditReward, setDailyCreditReward] = useState(50);
  const [welcomeCreditReward, setWelcomeCreditReward] = useState(100);
  const [generationCreditCost, setGenerationCreditCost] = useState(10);
  const [referralSignupReward, setReferralSignupReward] = useState(20);
  const [referralActivityReward, setReferralActivityReward] = useState(80);
  const [savingCredits, setSavingCredits] = useState(false);
  const [creditSearchEmail, setCreditSearchEmail] = useState("");
  const [creditAdjustment, setCreditAdjustment] = useState("");

  // User Management modals
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null,
  );
  const [adjustingCredits, setAdjustingCredits] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState(0);

  const [viewHistoryUserId, setViewHistoryUserId] = useState<string | null>(null);
  const [viewHistoryUserName, setViewHistoryUserName] = useState<string | null>(null);
  const [userHistory, setUserHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedDesignerDetail, setSelectedDesignerDetail] = useState<any | null>(null);
  const [fetchingDesignerDetail, setFetchingDesignerDetail] = useState(false);

  const fetchDesignerDetail = async (profile: any) => {
    setFetchingDesignerDetail(true);
    setSelectedDesignerDetail(null);
    const profileId = profile.id;
    let ncpTxs: any[] = [];
    try {
      // Fetch credit history sync for this designer directly from NCP
      let allNcpTxs: any[] = [];
      let currentPage = 1;
      let keepFetching = true;
      while (keepFetching) {
         try {
           const res = await apiClient.get('/faceswap/credit/history', { 
              params: { month: 12, filter: 'ALL', pageNo: currentPage, pageSize: 50, designerId: profileId } 
           });
           const items = res.data?.content || res.data?.data || res.data?.items || res.data;
           if (items && Array.isArray(items) && items.length > 0) {
              allNcpTxs = [...allNcpTxs, ...items];
              const totalCount = res.data?.totalElements || res.data?.totalCount || 0;
              if (totalCount > 0 && allNcpTxs.length < totalCount) {
                  currentPage++;
              } else {
                  keepFetching = false;
              }
           } else {
              keepFetching = false;
           }
         } catch (e1) {
           try {
             const res = await accountClient.get('/faceswap/credit/history', { 
                params: { month: 12, filter: 'ALL', pageNo: currentPage, pageSize: 50, designerId: profileId } 
             });
             const items = res.data?.content || res.data?.data || res.data?.items || res.data;
             if (items && Array.isArray(items) && items.length > 0) {
                allNcpTxs = [...allNcpTxs, ...items];
                const totalCount = res.data?.totalElements || res.data?.totalCount || 0;
                if (totalCount > 0 && allNcpTxs.length < totalCount) {
                    currentPage++;
                } else {
                    keepFetching = false;
                }
             } else {
                keepFetching = false;
             }
           } catch (e2) {
             keepFetching = false;
           }
         }
      }
      ncpTxs = allNcpTxs;
    } catch(e) { console.log('Credit fetch err'); }

    try {
      // Use core admin designer detail API instead of accountClient
      const { data } = await apiClient.get('/admin/designer', {
        params: { designerId: profileId }
      });
      // NCP list gives us 'credit', but detail object doesn't, so we merge
      setSelectedDesignerDetail({ 
        ...profile, 
        ...data, 
        provider: profile.provider || data.provider || data.signedBy || data.loginType || data.snsType || null,
        email: profile.email || data.email || null,
        mobileNumber: profile.mobileNumber || data.mobileNumber || null,
        career: null,
        introduce: data.introduce || data.introduction || null,
        ncpCreditHistory: ncpTxs, 
        supaProfile: profile 
      });
    } catch (err: any) {
      console.warn('Failed to fetch designer details from core admin API, trying accountClient fallback:', err);
      try {
        const { data } = await accountClient.get(`/designer/detail/${profileId}`);
        setSelectedDesignerDetail({ 
           ...profile, 
           ...data, 
           provider: profile.provider || data.provider || data.signedBy || data.loginType || data.snsType || null,
           email: profile.email || data.email || null,
           mobileNumber: profile.mobileNumber || data.mobileNumber || null,
           career: null,
           ncpCreditHistory: ncpTxs, 
           supaProfile: profile 
        });
      } catch (fallbackErr) {
        console.error('Failed to fetch designer details from all endpoints:', fallbackErr);
        alert('디자이너 상세 정보를 불러오는데 실패했습니다.');
      }
    } finally {
      setFetchingDesignerDetail(false);
    }
  };

  const fetchUserHistory = async (userId: string, userName: string) => {
    setViewHistoryUserId(userId);
    setViewHistoryUserName(userName);
    setLoadingHistory(true);
    let ncpTxs: any[] = [];
    
    try {
      // Find user to map ncp_designer_id
      const profileInfo = profiles.find((p) => p.id === userId);
      const targetDesignerId = profileInfo?.ncp_designer_id || userId;
      
      let allNcpTxs: any[] = [];
      let currentPage = 1;
      let keepFetching = true;

      while (keepFetching) {
         try {
           const res = await apiClient.get('/faceswap/credit/history', { 
              params: { month: 12, filter: 'ALL', pageNo: currentPage, pageSize: 50, designerId: targetDesignerId } 
           });
           const items = res.data?.content || res.data?.data || res.data?.items || res.data;
           if (items && Array.isArray(items) && items.length > 0) {
              allNcpTxs = [...allNcpTxs, ...items];
              const totalCount = res.data?.totalElements || res.data?.totalCount || 0;
              if (totalCount > 0 && allNcpTxs.length < totalCount) {
                  currentPage++;
              } else {
                  keepFetching = false;
              }
           } else {
              keepFetching = false;
           }
         } catch (e1) {
           console.log("apiClient /faceswap/credit/history not hosted on core. Quietly attempting account server query.");
           const res = await accountClient.get('/faceswap/credit/history', { 
              params: { month: 12, filter: 'ALL', pageNo: currentPage, pageSize: 50, designerId: targetDesignerId } 
           });
           const items = res.data?.content || res.data?.data || res.data?.items || res.data;
           if (items && Array.isArray(items) && items.length > 0) {
              allNcpTxs = [...allNcpTxs, ...items];
              const totalCount = res.data?.totalElements || res.data?.totalCount || 0;
              if (totalCount > 0 && allNcpTxs.length < totalCount) {
                  currentPage++;
              } else {
                  keepFetching = false;
              }
           } else {
              keepFetching = false;
           }
         }
      }

      if (allNcpTxs.length > 0) {
        ncpTxs = allNcpTxs;
      }
    } catch (err) {
      console.log("NCP specialized credit history endpoints are not hosted. Seamlessly fall back to Supabase transactions.");
    }
    
    try {
      if (ncpTxs.length > 0) {
        const getCreditTypeDescription = (type: string, amount: number) => {
          const map: Record<string, string> = {
            CHARGE: '크레딧 충전',
            MEMBERSHIP_BONUS: '멤버십 가입 보너스',
            REFERRAL: '친구 추천 보상',
            SIGNUP: '신규 가입 보상',
            DAILY: '출석 보상',
            AI_FACE_SWAP: 'AI 얼굴 합성 사용',
            AI_FACE_SWAP_MEMBERSHIP: 'AI 얼굴 합성 (멤버십)',
            AI_VIDEO: 'AI 영상 생성 사용',
            AI_VIDEO_MEMBERSHIP: 'AI 영상 생성 (멤버십)',
            REFUND_AI_FACE_SWAP: 'AI 얼굴 합성 환불',
            REFUND_AI_FACE_SWAP_MEMBERSHIP: 'AI 얼굴 합성 환불 (멤버십)',
            REFUND_AI_VIDEO: 'AI 영상 생성 환불',
            REFUND_AI_VIDEO_MEMBERSHIP: 'AI 영상 생성 환불 (멤버십)',
            REVOKE_MEMBERSHIP_CREDIT: '멤버십 크레딧 회수'
          };
          return map[type] || (amount > 0 ? '크레딧 적립' : '크레딧 차감');
        };

        const mappedTxs = ncpTxs.map((t: any) => ({
          id: t.id || t.pointHistoryId || Math.random().toString(),
          type: (t.amount > 0) ? 'earned' : 'deducted',
          amount: Math.abs(t.amount || t.point || 0),
          description: t.description || getCreditTypeDescription(t.type, t.amount),
          created_at: t.date || t.createdAt || new Date().toISOString()
        }));
        setUserHistory(mappedTxs);
      } else {
        // Fallback to Supabase if no NCP rows found
        const { data, error } = await supabase
          .from("credit_transactions")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setUserHistory(data || []);
      }
    } catch (err) {
      console.error("Error fetching user history:", err);
      // alert("이력 조회 중 오류가 발생했습니다.");
    } finally {
      setLoadingHistory(false);
    }
  };

  const [totalCreditRevenue, setTotalCreditRevenue] = useState(0);
  const [creditRanking, setCreditRanking] = useState<
    { email: string; spent: number }[]
  >([]);

  const [pgClientKey, setPgClientKey] = useState("");
  const [pgSecretKey, setPgSecretKey] = useState("");
  const [savingPg, setSavingPg] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const toggleModelSelection = (id: string) => {
    setSelectedModelIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id],
    );
  };

  const handleSavePgSettings = async () => {
    if (pgClientKey.includes('gck')) {
      alert('위젯용 키(gck)가 입력되었습니다. 결제 위젯키가 아닌 "API 개별 연동 키"의 클라이언트 키를 입력해주세요.');
      return;
    }
    setSavingPg(true);
    try {
      // 관리자 설정 저장은 Supabase 세션 토큰을 사용합니다. 일반 회원(NCP) 토큰은 절대 사용하지 않습니다.
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || null;

      if (!token) {
        throw new Error('관리자 인증 토큰을 찾을 수 없습니다. 다시 로그인해 주세요.');
      }

      const response = await fetch('/api/admin/site-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tossClientKey: pgClientKey,
          tossSecretKey: pgSecretKey
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${response.status}`);
      }

      alert('PG 연동 설정이 성공적으로 저장되었습니다.');
    } catch (err: any) {
      console.error(err);
      alert('저장 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setSavingPg(false);
    }
  };

  const handleSaveIntegrationsSettings = async () => {
    setSavingSettings(true);
    try {
      await updateSettings({
        ...siteSettings,
        integrations: {
          ...siteSettings.integrations,
          facefusionUrl
        }
      });
      alert('통합 연동 설정이 성공적으로 저장되었습니다.');
    } catch (err: any) {
      console.error(err);
      alert('저장 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSelectAll = (modelIds: string[]) => {
    if (selectedModelIds.length === modelIds.length && modelIds.length > 0) {
      setSelectedModelIds([]);
    } else {
      setSelectedModelIds(modelIds);
    }
  };

  useEffect(() => {
    // If not logged in or not admin, redirect to home
    const isNcpAdmin = localStorage.getItem('ncp_admin') === 'true';
    if (isNcpAdmin) return;
    
    if (!user?.id) {
      navigate("/");
    } else if (user.email !== "cubric.ceo@gmail.com") {
      navigate("/");
    }
  }, [user?.id, user?.email, navigate]);

  useEffect(() => {
    // Update document title based on admin active tab
    const titleMap: Record<string, string> = {
      dashboard: "프리미엄 대시보드",
      leads: "프리미엄 살롱 도입 문의 관리",
      categories: "시술명(스타일) 관리",
      "preset-images": "AI 모델 이미지 관리",
      users: "가입자 관리",
      visitors: "방문자 로그",
      subscriptions: "구독 및 결제 관리",
      credits: "크레딧 관리"
    };
    document.title = `${titleMap[activeTab] || "관리자 페이지"} - Cubric`;
  }, [activeTab]);

  const getDesignerCreatedAt = (designer: any) => {
    if (!designer) return null;
    const possibleKeys = [
      'createdAt',
      'createdDateTime',
      'createdDate',
      'createDateTime',
      'createDate',
      'registerDate',
      'regDate',
      'regDateTime',
      'created',
      'created_at',
      'joinedAt',
      'registerDateTime'
    ];
    for (const key of possibleKeys) {
      if (designer[key]) return designer[key];
    }
    if (designer.profile) {
      for (const key of possibleKeys) {
        if (designer.profile[key]) return designer.profile[key];
      }
    }
    return null;
  };

  const fetchData = async () => {
    if (!isAdmin) return;
    if (inquiries.length === 0 && profiles.length === 0) {
      setIsLoading(true);
    }
    
    let cleanProviders: Record<string, string> = {};
    let cleanEmails: Record<string, string> = {};
    let cleanPhones: Record<string, string> = {};

    try {
      // 1. Fetch real auth providers / identities from Supabase Auth via our backend proxy
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token || localStorage.getItem('ncp_access_token');
        if (token) {
          const provRes = await fetch('/api/admin/user-providers', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (provRes.ok) {
            const provData = await provRes.json();
            const providersMap = provData.providers || {};
            const emailsMap = provData.emails || {};
            const phonesMap = provData.phones || {};
            
            Object.entries(providersMap).forEach(([k, v]) => {
              cleanProviders[k.replace(/-/g, '').toLowerCase()] = String(v);
            });
            Object.entries(emailsMap).forEach(([k, v]) => {
              cleanEmails[k.replace(/-/g, '').toLowerCase()] = String(v);
            });
            Object.entries(phonesMap).forEach(([k, v]) => {
              cleanPhones[k.replace(/-/g, '').toLowerCase()] = String(v);
            });

            setUserProvidersMap(cleanProviders);
            setUserEmailsMap(cleanEmails);
            setUserPhonesMap(cleanPhones);
            console.log(`[AdminPage] Successfully loaded ${Object.keys(cleanProviders).length} user providers from backend.`);
          }
        }
      } catch (err) {
        console.warn("Failed to load user providers:", err);
      }

      // Fetch inquiries
      const { data: inquiryData, error: inquiryError } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (inquiryError)
        console.error("Error fetching inquiries:", inquiryError);
      else setInquiries(inquiryData || []);

      // Fetch AI Models from NCP API
      try {
        const modelsRes = await apiClient.get('/faceswap/models');
        if (modelsRes.data && modelsRes.data.data) {
          const mappedModels = modelsRes.data.data.map((m: any) => ({
            id: m.uid,
            gender: m.gender?.toLowerCase() || 'female',
            description: m.description || m.name || '',
            name: m.name || '',
            image_url: m.file?.details?.[0] ? `https://api.cubric.io/api/storage?fileName=${m.file.details[0]}` : '',
            is_active: true,
            sort_order: m.id // NCP id as proxy for sort_order or similar
          }));
          // Sort by id descending
          mappedModels.sort((a: any, b: any) => b.sort_order - a.sort_order);
          setAiModels(mappedModels);
        }
      } catch (err) {
        console.error("Failed to fetch NCP AI models", err);
        setAiModels([]);
      }

      // Fetch users from NCP API (instead of Supabase)
      let usersData: any[] | null = null;
      let usersError: any = null;

      try {
        console.log("Attempting to load designers from NCP API (/admin/designers)...");
        let res;
        try {
          // Use apiClient for core AdminController endpoints!
          res = await apiClient.get('/admin/designers');
        } catch (errFirst: any) {
          console.warn("NCP API GET `/admin/designers` failed. Detailed error print:", {
            response_data: errFirst.response?.data,
            config_url: errFirst.config?.url,
            status: errFirst.response?.status,
            message: errFirst.message
          });
          
          console.log("Retrying with NCP API `/designer/all` on accountClient...");
          res = await accountClient.get('/designer/all');
        }

        let designersArray = [];
        if (Array.isArray(res.data)) {
          designersArray = res.data;
        } else if (res.data && Array.isArray(res.data.content)) {
          designersArray = res.data.content;
        } else if (res.data && Array.isArray(res.data.data)) {
          designersArray = res.data.data;
        } else if (res.data && Array.isArray(res.data.items)) {
          designersArray = res.data.items;
        } else {
          console.warn("NCP response format unrecognized:", res.data);
        }

        usersData = designersArray.map((designer: any) => {
          let ncpAvatarUrl = designer.profileImageUrl || null;
          const cands: string[] = [];
          const pf = designer.profile;
          if (pf) {
            if (pf.thumbNailPath) cands.push(pf.thumbNailPath);
            if (pf.fileName) cands.push(pf.fileName);
            if (pf.savedFileName) cands.push(pf.savedFileName);
            if (pf.savedPath) cands.push(pf.savedPath);
            if (pf.path) cands.push(pf.path);
            if (pf.url) cands.push(pf.url);
            if (pf.id) cands.push(pf.id);
            if (pf.fileId) cands.push(pf.fileId);
            if (pf.file_id) cands.push(pf.file_id);
          }
          if (designer.file_id) cands.push(designer.file_id);
          if (designer.fileId) cands.push(designer.fileId);
          if (cands.length > 0) {
            ncpAvatarUrl = Array.from(new Set(cands)).join(',');
          }

          return {
            id: designer.id || designer.accountId || designer.designerId,
            email: designer.email || designer.accountId,
            full_name: designer.name || '이름 없음',
            avatar_url: ncpAvatarUrl,
            last_login_at: designer.lastLoginAt || designer.updatedAt || null,
          credits: designer.credit ?? designer.credits ?? 0,
          membershipCredit: designer.membershipCredit ?? 0,
          subscription_plan: designer.subscriptionPlan || null,
          subscription_status: designer.subscriptionStatus || 'inactive',
          subscription_end_date: designer.subscriptionEndDate || null,
          created_at: getDesignerCreatedAt(designer),
          billing_key: designer.billingKey || null,
          card_company: designer.cardCompany || null,
          card_number: designer.cardNumber || null,
          is_blacklisted: designer.isBlacklisted || false,
          is_cs_admin: designer.isCsAdmin || false,
          business_status: designer.businessStatus || 'active',
          role: designer.role || 'user'
        };});

        setHasCreditsColumn(true);
      } catch (err: any) {
        usersError = err;
        console.error("NCP profile fetch failed completely! Real Error details printed below:", {
          response_data: err.response?.data,
          config_url: err.config?.url,
          status: err.response?.status,
          message: err.message
        });

        // ----------------- STRICT REQUIREMENT -----------------
        // 강제 Supabase 전환 금지: NCP API 호출 실패 시 Supabase 데이터를 불러오는 부분을 주석 처리합니다.
        /*
        console.warn("Supabase Fallback is DISABLED by user's design setup instruction.");
        const fullResult = await supabase
          .from("profiles")
          .select("id, email, full_name, avatar_url, last_login_at, credits, subscription_plan, subscription_status, subscription_end_date, created_at, billing_key, card_company, card_number, is_blacklisted, is_cs_admin, business_status, role")
          .order("created_at", { ascending: false });
        usersData = fullResult.data;
        */
        // ------------------------------------------------------
      }

      // Fetch internal administrator and staff members from Supabase profiles table
      let supabaseAdmins: any[] = [];
      const fetchAdminsWithRetryAndFallback = async (): Promise<any[]> => {
        let attempts = 3;
        let lastError = null;
        
        while (attempts > 0) {
          if (!isMountedRef.current) return [];
          try {
            const { data, error } = await supabase
              .from("profiles")
              .select("id, email, full_name, last_login_at, credits, subscription_plan, subscription_status, subscription_end_date, created_at, billing_key, card_company, card_number, is_blacklisted, is_cs_admin, business_status, role")
              .neq("role", "user");
              
            if (!error && data) {
              return data;
            }
            lastError = error;
          } catch (e: any) {
            lastError = e;
          }
          
          if (attempts > 1) {
            // Progressive delay
            await new Promise((resolve) => setTimeout(resolve, (4 - attempts) * 500));
          }
          attempts--;
        }
        
        console.warn("Retries failed for filtered admin query, testing robust fallback select(*)...", lastError);
        try {
          const { data, error } = await supabase.from("profiles").select("*");
          if (!error && data) {
            return data.filter((p: any) => p.role && p.role !== 'user');
          }
          if (error) {
            console.error("Fallback profiles select '*' also returned error:", error);
          }
        } catch (fbErr) {
          console.error("Severe fallback error querying profiles:", fbErr);
        }
        
        const DEFAULT_PRESET_ADMINS = [
          {
            id: "system-admin-fallback",
            email: "cubric.ceo@gmail.com",
            full_name: "최고 관리자 (통합)",
            role: "system_admin",
            business_status: "active",
            created_at: new Date().toISOString()
          }
        ];
        return DEFAULT_PRESET_ADMINS;
      };

      try {
        supabaseAdmins = await fetchAdminsWithRetryAndFallback();
      } catch (e) {
        console.error("Failed to query admins from Supabase profiles:", e);
      }

      if (!usersError && usersData) {
        // Fetch NCP details for each user concurrently
        const usersWithNCP = await Promise.all(usersData.map(async (u: any) => {
          let ncpData: any = {};
          try {
            // First try core Admin API details query
            const res = await apiClient.get('/admin/designer', {
              params: { designerId: u.id }
            });
            if (res.data) ncpData = res.data;
          } catch (errFirst: any) {
            try {
              const res = await accountClient.get(`/designer/detail/${u.id}`);
              if (res.data) ncpData = res.data;
            } catch (err: any) {
              // Fail silently since we already have the basic items data
            }
          }
          let ncpAvatarUrl = ncpData.profileImageUrl || u.avatar_url;
          const cands: string[] = [];
          const pf = ncpData.profile;
          if (pf) {
            if (pf.thumbNailPath) cands.push(pf.thumbNailPath);
            if (pf.fileName) cands.push(pf.fileName);
            if (pf.savedFileName) cands.push(pf.savedFileName);
            if (pf.savedPath) cands.push(pf.savedPath);
            if (pf.path) cands.push(pf.path);
            if (pf.url) cands.push(pf.url);
            if (pf.id) cands.push(pf.id);
            if (pf.fileId) cands.push(pf.fileId);
            if (pf.file_id) cands.push(pf.file_id);
          }
          if (ncpData.file_id) cands.push(ncpData.file_id);
          if (ncpData.fileId) cands.push(ncpData.fileId);
          if (cands.length > 0) {
            ncpAvatarUrl = Array.from(new Set(cands)).join(',');
          }
          
          const cleanUId = u.id ? u.id.replace(/-/g, '').toLowerCase() : '';
          const realProvider = cleanProviders[cleanUId] || null;
          const realEmail = cleanEmails[cleanUId] || ncpData.email || u.email || ncpData.accountId || u.id || '';
          const realPhone = cleanPhones[cleanUId] || ncpData.mobileNumber || u.mobileNumber || '';

          return {
            ...u,
            credits: u.credits !== undefined ? Number(u.credits || 0) : 0,
            full_name: ncpData.name || u.name || u.full_name,
            avatar_url: ncpAvatarUrl,
            business_status: typeof ncpData.businessStatus === 'string' ? ncpData.businessStatus : (u.business_status || u.status || 'active'),
            ncp_synced: !!(ncpData.email || u.email || ncpData.accountId || u.id), // Custom flag to show if they exist in NCP
            created_at: getDesignerCreatedAt(ncpData) || u.created_at,
            provider: realProvider || ncpData.provider || u.provider || ncpData.signedBy || ncpData.loginType || ncpData.snsType || null,
            signedBy: realProvider || ncpData.signedBy || u.signedBy || null,
            loginType: realProvider || ncpData.loginType || u.loginType || null,
            snsType: realProvider || ncpData.snsType || u.snsType || null,
            email: realEmail,
            mobileNumber: realPhone
          };
        }));
        
        if (!isMountedRef.current) return;

        // Merge the staff/admin accounts from Supabase with the partner/designer list from NCP
        const combinedProfiles = [...usersWithNCP, ...supabaseAdmins];
        setProfiles(combinedProfiles);
        setTotalUsers(usersWithNCP.length);
        
        // Log privacy action: VIEW
        try {
          await logPrivacyAction('VIEW', 'profiles', 'ALL', { source: 'AdminPage_Load_NCP_And_Supabase_Admins' });
        } catch (e) {}
      } else {
        if (!isMountedRef.current) return;
        // Since we are explicitly requested to NOT fallback to Supabase for the designers, we set designers to empty
        // but still maintain the Supabase admin accounts loaded to let internal management work
        setProfiles(supabaseAdmins);
        setTotalUsers(0);
        console.warn("No designer profiles loaded from NCP due to failure. Internal staff loaded:", supabaseAdmins.length);
      }

      // Fetch duplicated IP setting & Credit setting
      const { data: metricsData, error: metricsDataErr } = await supabase
        .from("app_metrics")
        .select("*")
        .eq("id", 1)
        .single();
      if (metricsData) {
        if (
          metricsData.prevent_duplicate_ip !== undefined &&
          metricsData.prevent_duplicate_ip !== null
        ) {
          setPreventDuplicateIp(metricsData.prevent_duplicate_ip);
        }
        if (
          metricsData.daily_credit_reward !== undefined &&
          metricsData.daily_credit_reward !== null
        )
          setDailyCreditReward(metricsData.daily_credit_reward);
        if (
          metricsData.welcome_credit_reward !== undefined &&
          metricsData.welcome_credit_reward !== null
        )
          setWelcomeCreditReward(metricsData.welcome_credit_reward);
        if (
          metricsData.generation_credit_cost !== undefined &&
          metricsData.generation_credit_cost !== null
        )
          setGenerationCreditCost(metricsData.generation_credit_cost);
        if (
          metricsData.referral_signup_reward !== undefined &&
          metricsData.referral_signup_reward !== null
        )
          setReferralSignupReward(metricsData.referral_signup_reward);
        if (
          metricsData.referral_activity_reward !== undefined &&
          metricsData.referral_activity_reward !== null
        )
          setReferralActivityReward(metricsData.referral_activity_reward);
      }

      // Fetch Visitor Logs
      const { data: logsData, error: logsDataError } = await supabase
        .from("visitor_logs")
        .select("*")
        .order("visited_at", { ascending: false })
        .limit(100);

      if (logsDataError) {
        if (logsDataError.code === "42P01") {
          setLogsError(
            "Supabase에 visitor_logs 테이블이 생성되지 않았습니다.",
          );
        } else {
          setLogsError(logsDataError.message);
        }
      } else {
        setVisitorLogs(logsData || []);
      }

      // Fetch Hair Styles
      let hsData: any[] = [];
      const { data: hairStylesData, error: hairStylesError } = await supabase
        .from("hair_styles")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
        
      if (hairStylesError) {
        console.warn("hair_styles sort_order failed, fallback");
        const { data: fallbackData } = await supabase.from("hair_styles").select("*").order("created_at", { ascending: false });
        hsData = fallbackData || [];
      } else {
        hsData = hairStylesData || [];
      }
      setHairStyles(hsData);

      // Fetch Site Settings
      const { data: settingsData, error: settingsError } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", "default")
        .single();
      if (!settingsError && settingsData) {
        setPgClientKey(settingsData.toss_client_key || "");
        setPgSecretKey(settingsData.toss_secret_key || "");
      }
    } catch (err) {
      console.error("Error in admin fetch:", err);
    } finally {
      try {
        // Fetch the metrics & ranks for credits
        const { data: txsData, error: txsError } = await supabase.from(
          "credit_transactions",
        ).select(`
            type, amount, user_id, description
        `).eq('type', 'spent');

        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email');

        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('amount, payment_type');

        if (!txsError && txsData && !profilesError && Array.isArray(profilesData)) {
          const rankingMap: Record<string, number> = {};
          // Map user IDs to emails from the usersData fetch
          const userEmailMap: Record<string, string> = {};
          profilesData.forEach(u => { userEmailMap[u.id] = u.email; });

          if (Array.isArray(txsData)) {
            txsData.forEach((tx: any) => {
              const email = userEmailMap[tx.user_id];
              if (email) {
                rankingMap[email] = (rankingMap[email] || 0) + tx.amount;
              }
            });
          }

          const sortedRanking = Object.entries(rankingMap)
            .map(([email, spent]) => ({ email, spent }))
            .sort((a, b) => b.spent - a.spent)
            .slice(0, 3);

          setCreditRanking(sortedRanking);
        }

        if (!paymentsError && Array.isArray(paymentsData)) {
          // 1. Calculate Revenue from the new 'payments' table (Primary source)
          let totalRev = paymentsData.reduce((sum, p) => sum + (p.amount || 0), 0);
          
          setTotalCreditRevenue(totalRev);
        }
      } catch (err) {
        console.error("Error calculating credit metrics:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAdmin, activeTab]);

  const updateInquiryStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("inquiries")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === id ? { ...inq, status: newStatus } : inq,
        ),
      );
    } catch (err) {
      console.error("Error updating status:", err);
      alert("상태 업데이트 실패");
    }
  };

  const handleSaveCreditSettings = async () => {
    setSavingCredits(true);
    try {
      // First try to update
      const { error, data } = await supabase
        .from("app_metrics")
        .update({
          daily_credit_reward: dailyCreditReward,
          welcome_credit_reward: welcomeCreditReward,
          generation_credit_cost: generationCreditCost,
          referral_signup_reward: referralSignupReward,
          referral_activity_reward: referralActivityReward
        })
        .eq("id", 1)
        .select();

      if (error) {
        if (error.code === "42703") {
          alert(
            "app_metrics 테이블에 크레딧 관련 컬럼이 모두 설정되어 있지 않습니다.",
          );
        } else {
          throw error;
        }
      } else if (!data || data.length === 0) {
        // Row doesn't exist, try to insert
        const { error: insertError } = await supabase
          .from("app_metrics")
          .insert([
            {
              id: 1,
              daily_credit_reward: dailyCreditReward,
              welcome_credit_reward: welcomeCreditReward,
              generation_credit_cost: generationCreditCost,
              referral_signup_reward: referralSignupReward,
              referral_activity_reward: referralActivityReward,
              prevent_duplicate_ip: true,
            },
          ]);
        if (insertError) throw insertError;
        alert("크레딧 설정이 저장되었습니다. (신규 생성)");
      } else {
        alert("크레딧 설정이 저장되었습니다.");
      }
    } catch (err: any) {
      if (err.message && err.message.includes("row-level security")) {
        alert(
          '크레딧 설정 저장 실패: RLS 정책 위반입니다.\n\nSupabase SQL Editor에서 다음 SQL을 실행하여 업데이트를 허용해주세요:\n\nDROP POLICY IF EXISTS "Enable update for all users" ON "public"."app_metrics";\nCREATE POLICY "Enable update for all users" ON "public"."app_metrics" FOR UPDATE USING (true);\n\n-- (필요시 Insert 권한도 허용)\nCREATE POLICY "Enable insert for all users" ON "public"."app_metrics" FOR INSERT WITH CHECK (true);',
        );
      } else {
        alert("크레딧 설정 저장 실패: " + err.message);
      }
    } finally {
      setSavingCredits(false);
    }
  };

  const [isEmailDropdownOpen, setIsEmailDropdownOpen] = useState(false);
  const emailDropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emailDropdownRef.current && !emailDropdownRef.current.contains(event.target as Node)) {
        setIsEmailDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredEmails = profiles
    .map(p => p.email)
    .filter(email => {
      if (!email) return false;
      if (!creditSearchEmail) return true; // Show all when empty
      return email.toLowerCase().includes(creditSearchEmail.toLowerCase());
    })
    .slice(0, 50);

  const handleAdjustUserCredits = async () => {
    if (!creditSearchEmail || !creditAdjustment) return;
    setSavingCredits(true);
    try {
      // Find the user by email
      const { data: userData, error: fetchError } = await supabase
        .from("profiles")
        .select("id, credits, full_name")
        .eq("email", creditSearchEmail)
        .single();

      if (fetchError || !userData) {
        alert("해당 이메일을 가진 사용자를 찾을 수 없습니다.");
        setSavingCredits(false);
        return;
      }

      const userId = userData.id;
      const currentCredits = userData.credits || 0;
      const adjustAmountValue = parseInt(creditAdjustment) || 0;
      const newCredits = currentCredits + adjustAmountValue;

      const { data: updatedData, error } = await supabase
        .from("profiles")
        .update({ credits: newCredits })
        .eq("id", userId)
        .select();

      if (error) {
        if (error.code === "42703") {
          throw new Error(
            "profiles 테이블에 credits 컬럼이 없습니다. Supabase SQL Editor에서 다음을 실행해주세요:\nALTER TABLE profiles ADD COLUMN credits INTEGER DEFAULT 0;",
          );
        }
        throw error;
      }
      
      if (!updatedData || updatedData.length === 0) {
        throw new Error(
            'Supabase RLS 보안 정책에 의해 업데이트가 거부되었습니다.\n\n프로젝트 루트의 database_setup_credits.sql 스크립트를 확인하고 Supabase에서 실행해주세요.'
        );
      }

      const adjustmentDescription = adjustAmountValue > 0 ? `관리자 크레딧 보상   + ${Math.abs(adjustAmountValue)}` : `관리자 크레딧 차감   - ${Math.abs(adjustAmountValue)}`;

      const { error: txError } = await supabase.from("credit_transactions").insert([
        {
          user_id: userId,
          type: adjustAmountValue > 0 ? "earned" : "spent",
          amount: Math.abs(adjustAmountValue),
          description: adjustmentDescription,
        },
      ]);

      if (txError) {
        if (txError.message.includes("row-level security") || txError.code === "42501") {
          console.warn("RLS Error on credit_transactions. Transaction log skipped, but credits WERE updated.");
          alert('내역 기록은 RLS 정책으로 실패했지만 크레딧은 정상 반영되었습니다!\n\n(database_setup_credits.sql 파일 내용을 Supabase SQL Editor에서 실행해주시면 내역도 기록됩니다.)');
        } else {
           console.error("Tx Error", txError);
        }
      }

      await fetchData(); // Refresh all data to ensure sync
      window.dispatchEvent(new Event("credits_updated"));

      alert(
        `${userData.full_name || creditSearchEmail}님의 크레딧이 ${currentCredits}C 에서 ${newCredits}C 로 조정되었습니다.`
      );
      setCreditSearchEmail("");
      setCreditAdjustment("");
    } catch (err: any) {
      alert("크레딧 조정 실패: " + err.message);
    } finally {
      setSavingCredits(false);
    }
  };

  const togglePreventDuplicateIp = async () => {
    try {
      const newValue = !preventDuplicateIp;

      const { error } = await supabase
        .from("app_metrics")
        .update({ prevent_duplicate_ip: newValue })
        .eq("id", 1);

      if (error) {
        if (error.code === "42703") {
          alert(
            "app_metrics 테이블에 prevent_duplicate_ip 컬럼이 없습니다. Supabase 설정을 확인해 주시고 추가해 주세요.\\n\\nALTER TABLE app_metrics ADD COLUMN prevent_duplicate_ip BOOLEAN DEFAULT true;",
          );
        } else {
          throw error;
        }
      } else {
        setPreventDuplicateIp(newValue);
      }
    } catch (err) {
      console.error("Failed to toggle prevent duplicate IP", err);
      alert("설정 변경 실패");
    }
  };

  const handleAdjustUserCreditsFromList = async (
    userId: string,
    currentCredits: number,
  ) => {
    if (adjustAmount === 0) return;
    setAdjustingCredits(true);
    try {
      // 1. First try NCP Admin Credit Add API
      let finalNewCredits = currentCredits + adjustAmount;
      let ncpSuccess = false;

      try {
         // Using apiClient which proxies to http://hairdeal.cubric.io/api
         const ncpRes = await apiClient.post('/faceswap/credit/admin/add', null, {
            params: {
              designerUid: userId,
              amount: adjustAmount
            }
         });
         
         if (ncpRes.data) {
           const c = ncpRes.data.credit || 0;
           const m = ncpRes.data.membershipCredit || 0;
           finalNewCredits = c + m;
           ncpSuccess = true;
         }
      } catch (ncpErr: any) {
         console.warn("NCP credit add failed, fallback to Supabase standalone:", ncpErr.response?.data || ncpErr.message);
      }

      // 2. Synchronize to Supabase profiles (either exact synced value or standalone calculated value)
      const { data: updatedData, error } = await supabase
        .from("profiles")
        .update({ credits: finalNewCredits })
        .eq("id", userId)
        .select();

      if (error) {
        if (error.code === "42703") {
          throw new Error(
            "profiles 테이블에 credits 컬럼이 없습니다. Supabase SQL Editor에서 다음을 실행해주세요:\nALTER TABLE profiles ADD COLUMN credits INTEGER DEFAULT 0;",
          );
        }
        throw error;
      }
      
      if (!updatedData || updatedData.length === 0) {
        throw new Error(
            'Supabase RLS 보안 정책에 의해 업데이트가 거부되었습니다.\n\n프로젝트 루트의 database_setup_credits.sql 스크립트를 확인하고 Supabase에서 실행해주세요.'
        );
      }

      // Skip Supabase logging if NCP succeeded, since NCP generates its own history log internally!
      if (!ncpSuccess) {
        const adjustmentDescription = adjustAmount > 0 ? `관리자 크레딧 보상   + ${Math.abs(adjustAmount)}` : `관리자 크레딧 차감   - ${Math.abs(adjustAmount)}`;

        const { error: txError } = await supabase.from("credit_transactions").insert([
          {
            user_id: userId,
            type: adjustAmount > 0 ? "earned" : "spent",
            amount: Math.abs(adjustAmount),
            description: adjustmentDescription,
          },
        ]);

        if (txError) {
          if (txError.message.includes("row-level security") || txError.code === "42501") {
            console.warn("RLS Error on credit_transactions. Transaction log skipped, but credits WERE updated.");
            alert('내역 기록은 RLS 정책으로 실패했지만 크레딧은 정상 반영되었습니다!\n\n(database_setup_credits.sql 파일 내용을 Supabase SQL Editor에서 실행해주시면 내역도 기록됩니다.)');
          } else {
             console.error("Tx Error", txError);
          }
        }
      }

      await fetchData(); // Refresh all data to ensure sync
      window.dispatchEvent(new Event("credits_updated"));
      
      if (ncpSuccess) {
        alert(`NCP 서버에 크레딧이 조정되었습니다. 총 보유 크레딧: ${finalNewCredits} CR`);
      } else {
        alert("크레딧이 조정되었습니다.");
      }
    } catch (err: any) {
      alert("실패: " + err.message);
    } finally {
      setAdjustingCredits(false);
      setSelectedProfileId(null);
      setAdjustAmount(0);
    }
  };

  const toggleBlacklist = async (userId: string, currentStatus: boolean) => {
    if (
      !window.confirm(
        currentStatus
          ? "이 사용자의 블랙리스트를 해제하시겠습니까?"
          : "이 사용자를 블랙리스트로 제한(이용 정지)하시겠습니까?",
      )
    )
      return;
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_blacklisted: !currentStatus })
        .eq("id", userId);
      if (error) throw error;
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === userId ? { ...p, is_blacklisted: !currentStatus } : p,
        ),
      );
      await fetchData();
    } catch (err: any) {
      alert("상태 변경 실패: " + err.message);
    }
  };

  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Parse custom storage path from public URL
  const extractStoragePath = (url: string) => {
    const marker = "/storage/v1/object/public/models/";
    if (url.includes(marker)) {
      return url.split(marker)[1];
    }
    return null;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    try {
      if (editingModelId || files.length === 1) {
        // 단일 파일 업로드 또는 수정 모드
        const file = files[0];
        setNewModelFile(file);
        setNewModelUrl(URL.createObjectURL(file));
      } else {
        // 다중 파일 업로드 -> 바로 등록
        let uploadedModels: any[] = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const formData = new FormData();
          formData.append('name', `${newModelGender === "female" ? "여성" : "남성"}`);
          formData.append('description', newModelDesc || `${newModelGender === "female" ? "여성" : "남성"} 모델 이미지 (${i + 1})`);
          formData.append('gender', newModelGender === "female" ? "Female" : "Male");
          formData.append('file', file);

          try {
            const token = localStorage.getItem('ncp_access_token');
            const res = await axios.post('/api/core/faceswap/upload', formData, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.data) {
              const m = res.data;
              uploadedModels.push({
                id: m.uid,
                gender: m.gender?.toLowerCase() || newModelGender,
                description: m.description || m.name || '',
                name: m.name || '',
                image_url: m.file?.details?.[0] ? `https://api.cubric.io/api/storage?fileName=${m.file.details[0]}` : '',
                is_active: true,
                sort_order: 0,
              });
            }
          } catch(uploadErr) {
            console.error(`Failed to upload ${file.name}:`, uploadErr);
          }
        }

        if (uploadedModels.length > 0) {
          setAiModels((prev) => [...uploadedModels, ...prev]);
          setTimeout(() => {
            alert(
              `${uploadedModels.length}장의 이미지가 카테고리 [${newModelGender === "female" ? "여성" : "남성"}]에 일괄 등록되었습니다.`,
            );
          }, 100);
          resetForm();
          setFilterGender(newModelGender);
        } else {
          alert("등록에 실패했습니다. (서버 오류)");
        }
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("이미지 업로드 실패: " + err.message);
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  const resetForm = () => {
    setEditingModelId(null);
    setNewModelGender("female");
    setNewModelDesc("");
    setNewModelUrl("");
    setNewModelFile(null);
  };

  const handleEditClick = (model: AiModel) => {
    setEditingModelId(model.id);
    setNewModelGender(model.gender);
    setNewModelDesc(model.description);
    setNewModelUrl(model.image_url);
    setNewModelFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddOrUpdateModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelDesc || !newModelUrl) return;

    setIsSubmittingModel(true);
    try {
      if (editingModelId) {
        // --- Edit Mode ---
        const formData = new FormData();
        formData.append('name', `${newModelGender === "female" ? "여성" : "남성"}`);
        formData.append('description', newModelDesc);
        formData.append('gender', newModelGender === "female" ? "Female" : "Male");
        if (newModelFile) {
          formData.append('file', newModelFile);
        }

        const token = localStorage.getItem('ncp_access_token');
        const res = await axios.put(`/api/core/faceswap/models/${editingModelId}`, formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.data) {
          const m = res.data;
          const updatedModel = {
            id: m.uid,
            gender: m.gender?.toLowerCase() || newModelGender,
            description: m.description || m.name || '',
            name: m.name || '',
            image_url: m.file?.details?.[0] ? `https://api.cubric.io/api/storage?fileName=${m.file.details[0]}` : newModelUrl,
            is_active: true,
            sort_order: 0,
          };
          setAiModels((prev) =>
            prev.map((item) => (item.id === editingModelId ? updatedModel : item)),
          );
          alert("모델 정보가 수정되었습니다.");
          resetForm();
        }
      } else {
        // --- Create Mode (Single File) ---
        if (!newModelFile) {
           alert("이미지 파일이 필요합니다. 이미지 URL 직접입력은 지원되지 않습니다.");
           return;
        }

        const formData = new FormData();
        formData.append('name', `${newModelGender === "female" ? "여성" : "남성"}`);
        formData.append('description', newModelDesc);
        formData.append('gender', newModelGender === "female" ? "Female" : "Male");
        formData.append('file', newModelFile);

        const token = localStorage.getItem('ncp_access_token');
        const res = await axios.post(`/api/core/faceswap/upload`, formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.data) {
          const m = res.data;
          const newModel = {
            id: m.uid,
            gender: m.gender?.toLowerCase() || newModelGender,
            description: m.description || m.name || '',
            name: m.name || '',
            image_url: m.file?.details?.[0] ? `https://api.cubric.io/api/storage?fileName=${m.file.details[0]}` : '',
            is_active: true,
            sort_order: 0,
          };
          setAiModels((prev) => [newModel, ...prev]);
          alert("모델이 성공적으로 등록되었습니다.");
          resetForm();
        }
      }
    } catch (err: any) {
      console.error("Error adding/updating model:", err);
      alert("모델 저장 실패: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmittingModel(false);
    }
  };

  const handleDeleteModel = async (model: AiModel) => {
    if (
      !window.confirm(
        "정말 이 모델을 삭제하시겠습니까?\n서버에 업로드된 이미지가 있다면 영구적으로 삭제됩니다.",
      )
    )
      return;

    try {
      const token = localStorage.getItem('ncp_access_token');
      await axios.delete(`/api/core/faceswap/models/${model.id}`, { headers: { 'Authorization': `Bearer ${token}` }});
      setAiModels((prev) => prev.filter((m) => m.id !== model.id));
      setSelectedModelIds((prev) => prev.filter((id) => id !== model.id));
    } catch (err: any) {
      console.error("Error deleting model:", err);
      alert("모델 삭제 실패: " + err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedModelIds.length === 0) return;
    if (
      !window.confirm(
        `선택한 ${selectedModelIds.length}개의 모델을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
      )
    )
      return;

    try {
      const token = localStorage.getItem('ncp_access_token');
      for (const uid of selectedModelIds) {
         try {
           await axios.delete(`/api/core/faceswap/models/${uid}`, { headers: { 'Authorization': `Bearer ${token}` } });
         } catch(e) {
           console.error(`Failed to delete model ${uid}`, e);
         }
      }

      setAiModels((prev) =>
        prev.filter((m) => !selectedModelIds.includes(m.id)),
      );
      setSelectedModelIds([]);
      // Refresh to ensure strictly what server sees
      setTimeout(() => fetchData(), 500);
    } catch (err) {
      console.error(err);
      alert("일괄 삭제 실패");
    }
  };

  const handleBulkChangeCategory = async (newGender: "female" | "male") => {
    if (selectedModelIds.length === 0) return;
    if (
      !window.confirm(
        `선택한 ${selectedModelIds.length}개의 항목을 ${newGender === "female" ? "여성" : "남성"} 카테고리로 이동하시겠습니까?`,
      )
    )
      return;

    try {
      const token = localStorage.getItem('ncp_access_token');
      const modelsToUpdate = aiModels.filter((m) => selectedModelIds.includes(m.id));
      for (const m of modelsToUpdate) {
         const formData = new FormData();
         formData.append('gender', newGender === "female" ? "Female" : "Male");
         formData.append('name', m.name || (m.gender === "female" ? "여성" : "남성"));
         formData.append('description', m.description || "");
         try {
            await axios.put(`/api/core/faceswap/models/${m.id}`, formData, {
               headers: { 'Authorization': `Bearer ${token}` }
            });
         } catch(e) {
            console.error(`Failed to update category for ${m.id}`, e);
         }
      }

      setAiModels((prev) =>
        prev.map((m) =>
          selectedModelIds.includes(m.id) ? { ...m, gender: newGender } : m,
        ),
      );
      setSelectedModelIds([]);
      alert("카테고리가 변경되었습니다.");
      setTimeout(() => fetchData(), 500);
    } catch (err) {
      console.error(err);
      alert("일괄 카테고리 변경 실패");
    }
  };

  const updateBusinessStatus = async (userId: string, newStatus: 'active' | 'dormant' | 'closed') => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ business_status: newStatus })
        .eq("id", userId);
      
      if (error) {
        if (error.code === '42703') {
          alert('profiles 테이블에 business_status 컬럼이 없습니다.');
        } else {
          throw error;
        }
        return;
      }
      
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === userId ? { ...p, business_status: newStatus } : p,
        ),
      );
      await fetchData();
    } catch (err: any) {
      alert("상태 업데이트 실패: " + err.message);
    }
  };

  const toggleBusinessStatus = async (userId: string, currentStatus: string | undefined) => {
    try {
      // Rotate active -> dormant -> closed -> active
      const nextStatus = !currentStatus || currentStatus === 'active' ? 'dormant' : (currentStatus === 'dormant' ? 'closed' : 'active');
      
      const { error } = await supabase
        .from("profiles")
        .update({ business_status: nextStatus })
        .eq("id", userId);
      
      if (error) {
        if (error.code === '42703') {
          alert('profiles 테이블에 business_status 컬럼이 없습니다. database_setup_cs.sql을 실행하세요.');
        } else {
          throw error;
        }
        return;
      }
      
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === userId ? { ...p, business_status: nextStatus } : p,
        ),
      );
    } catch (err: any) {
      alert("상태 변경 실패: " + err.message);
    }
  };

  const toggleCsAdmin = async (userId: string, currentState: boolean) => {
    try {
      if (
        !window.confirm(
          currentState
            ? "해당 사용자의 CS 관리자 권한을 해제하시겠습니까?"
            : "해당 사용자에게 CS 관리자 권한을 부여하시겠습니까?",
        )
      ) {
        return;
      }
      const { error } = await supabase
        .from("profiles")
        .update({ is_cs_admin: !currentState })
        .eq("id", userId);
      if (error) {
        if (error.code === '42703') {
          alert('profiles 테이블에 is_cs_admin 컬럼이 없습니다. database_setup_cs.sql을 실행하세요.');
        } else {
          throw error;
        }
        return;
      }
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === userId ? { ...p, is_cs_admin: !currentState } : p,
        ),
      );
      await fetchData();
    } catch (err: any) {
      console.error(err);
      alert("권한 변경 실패: " + err.message);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      if (
        !window.confirm(
          `해당 사용자의 시스템 권한을 '${newRole}'(으)로 변경하시겠습니까?`,
        )
      ) {
        return;
      }
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);
      if (error) {
         throw error;
      }
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === userId ? { ...p, role: newRole } : p,
        ),
      );
      await fetchData();
      try {
        await logPrivacyAction('UPDATE', 'profiles', userId, { source: 'AdminPage_RoleChange', newRole });
      } catch(e) {}
    } catch (err: any) {
      console.error(err);
      alert("권한 변경 실패: " + err.message);
    }
  };

  const handleAddOrUpdateHairStyle = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newHairStyleName.trim();
    if (!trimmedName) return;

    // Check for duplicates in current state (client-side check for better UX)
    const isDuplicate = hairStyles.some(
      (s) =>
        s.gender === newHairStyleGender &&
        s.name.toLowerCase() === trimmedName.toLowerCase() &&
        s.id !== editingStyleId,
    );

    if (isDuplicate) {
      alert(`이미 해당 성별에 '${trimmedName}' 시술명이 등록되어 있습니다.`);
      return;
    }

    try {
      if (editingStyleId) {
        const { data, error } = await supabase
          .from("hair_styles")
          .update({
            gender: newHairStyleGender,
            name: trimmedName,
          })
          .eq("id", editingStyleId)
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setHairStyles((prev) =>
            prev.map((s) => (s.id === editingStyleId ? data : s)),
          );
          setEditingStyleId(null);
          setNewHairStyleName("");
        }
      } else {
        const { data, error } = await supabase
          .from("hair_styles")
          .insert([
            {
              gender: newHairStyleGender,
              name: trimmedName,
              sort_order: hairStyles.filter(
                (s) => s.gender === newHairStyleGender,
              ).length,
            },
          ])
          .select()
          .single();

        if (error) {
          if (error.code === "23505") {
            // Unique constraint violation (if set up in SQL)
            alert("이미 등록된 시술명입니다.");
          } else if (error.code === "42P01") {
            alert(
              'hair_styles 테이블이 없습니다. 좌측 메뉴 상단이나 하단의 "SQL 가이드"를 참고해 테이블을 생성해주세요.',
            );
          } else {
            throw error;
          }
        } else if (data) {
          setHairStyles([...hairStyles, data]);
          setNewHairStyleName("");
        }
      }
    } catch (err: any) {
      console.error(err);
      alert("시술명 저장 실패: " + err.message);
    }
  };

  const handleDeleteHairStyle = async (id: string) => {
    if (!window.confirm("정말 이 시술명을 삭제하시겠습니까?")) return;
    try {
      const { error } = await supabase
        .from("hair_styles")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setHairStyles((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      alert("시술명 삭제 실패: " + err.message);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setAiModels((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex) as AiModel[];
        
        // Note: NCP API currently doesn't support 'sort_order' updates
        // So we just update the UI state locally
        return newArray;
      });
    }
  };

  const pendingCount = inquiries.filter((i) => i.status === "대기중").length;
  const activeSubscriptionCount = profiles.filter(p => p.subscription_status === 'active').length;
  const conversionRate = totalUsers > 0 ? ((activeSubscriptionCount / totalUsers) * 100).toFixed(1) : "0";
  
  // Calculate potential MRR from active subscriptions
  const currentMRR = profiles.filter(p => p.subscription_status === 'active').reduce((sum, p) => {
    if (p.subscription_plan === 'Pro') return sum + 29000;
    if (p.subscription_plan === 'Business') return sum + 99000;
    return sum;
  }, 0);

  const stats = [
    {
      name: "총 가입자 수",
      value: totalUsers.toLocaleString(),
      param: `Active Sub: ${activeSubscriptionCount}`,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      name: "구독 전환율",
      value: `${conversionRate}%`,
      param: "실제 활성 구독 비율",
      icon: CreditCard,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
    {
      name: "도입 문의",
      value: inquiries.length.toString(),
      param: `${pendingCount} new this week`,
      icon: Store,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      name: "월간 반복 매출 (MRR)",
      value: `₩${currentMRR.toLocaleString()}`,
      param: "활성 구독료 합계",
      icon: DollarSign,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
  ];

  if (!isAdmin) return null;

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('정말 이 회원을 삭제하시겠습니까? 데이터(결제, 크레딧, 프로필)가 완벽히 삭제되며 복구할 수 없습니다.')) return;
    
    try {
      const { error } = await supabase.rpc('delete_user_account', {
        target_user_id: userId
      });
      
      if (error) {
        if (error.message.includes('function delete_user_account')) {
          throw new Error('데이터베이스에 계정 삭제 기능이 설정되지 않았습니다. 관리자에게 설정 스크립트 실행을 요청하세요. (database_setup_account_management.sql)');
        }
        throw error;
      }
      
      alert('회원이 성공적으로 삭제되었습니다.');
      await fetchData();
    } catch (err: any) {
      console.error(err);
      alert('오류 발생: ' + err.message);
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const filteredModels =
    filterGender === "all"
      ? aiModels
      : aiModels.filter((m) => m.gender === filterGender);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col pt-20 z-50 transition-transform duration-300 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}>
        <div className="md:hidden absolute top-[18px] right-4 z-50">
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="px-6 py-6 border-b border-gray-100 mb-4 mt-12 md:mt-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tight">
              헤어딜 Admin
            </span>
          </div>
          <p className="text-xs text-gray-500 pl-10">SaaS Management</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-2 pb-24">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === "dashboard" ? "bg-brand-primary/10 text-brand-primary" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <Activity className="w-5 h-5" />
            대시보드
          </button>
          <button
            onClick={() => setActiveTab("inquiries")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === "inquiries" ? "bg-brand-primary/10 text-brand-primary" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <MessageSquare className="w-5 h-5" />
            도입 문의 관리
            {pendingCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("models")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === "models" ? "bg-brand-primary/10 text-brand-primary" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <Camera className="w-5 h-5" />
            AI 모델 이미지 관리
          </button>
          <button
            onClick={() => setActiveTab("hair-styles")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === "hair-styles" ? "bg-brand-primary/10 text-brand-primary" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <Edit2 className="w-5 h-5" />
            시술명(스타일) 관리
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === "users" ? "bg-brand-primary/10 text-brand-primary" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <Users className="w-5 h-5" />
            사용자/점주 계정 관리
          </button>
          <button
            onClick={() => setActiveTab("admins")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === "admins" ? "bg-brand-primary/10 text-brand-primary" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <Shield className="w-5 h-5" />
            내부 직원/관리자 계정
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === "logs" ? "bg-brand-primary/10 text-brand-primary" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <Globe className="w-5 h-5" />
            방문자 로그
          </button>
          <button
            onClick={() => setActiveTab("subscriptions")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === "subscriptions" ? "bg-brand-primary/10 text-brand-primary" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <CreditCard className="w-5 h-5" />
            구독 및 결제
          </button>
          <button
            onClick={() => setActiveTab("credits")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === "credits" ? "bg-brand-primary/10 text-brand-primary" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <Coins className="w-5 h-5" />
            크레딧 관리
          </button>
          <button
            onClick={() => setActiveTab("integrations")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === "integrations" ? "bg-brand-primary/10 text-brand-primary" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <Globe className="w-5 h-5" />
            API 연동 설정
          </button>
          <div className="pt-4 mt-2 border-t border-gray-100 flex flex-col gap-2">
            <button
              onClick={() => navigate("/security-admin")}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold rounded-xl transition-colors bg-slate-800 text-white hover:bg-slate-700 border border-slate-900`}
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-indigo-400" />
                보안/로그 관리 (ISMS)
              </div>
            </button>
            <button
              onClick={() => navigate("/admin/site-editor")}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold rounded-xl transition-colors bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200`}
            >
              <div className="flex items-center gap-3">
                <Layout className="w-5 h-5" />
                홈페이지 편집 전용
              </div>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/cs-admin")}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold rounded-xl transition-colors bg-purple-50 text-purple-700 hover:bg-purple-100`}
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5" />
                CS / 장애관리 이동
              </div>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200 flex flex-col gap-2">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <Globe className="w-4 h-4 text-gray-400" />
            사이트로 돌아가기
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4 animate-pulse" />
            로그아웃
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full pt-20 md:pt-24 pb-12 px-4 sm:px-6 md:px-8 xl:px-12 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Mobile Header Toggle */}
          <div className="md:hidden mb-6 mt-4 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <span className="font-bold text-gray-900">헤어딜 관리자</span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {activeTab === "dashboard" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl font-black text-gray-900 mb-2">
                프리미엄 대시보드
              </h1>
              <p className="text-gray-500 mb-8 font-medium">
                헤어딜 SaaS 플랫폼 현황을 한눈에 확인하세요.
              </p>

              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {stats.map((stat) => (
                      <div
                        key={stat.name}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div
                            className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}
                          >
                            <stat.icon className="w-6 h-6" />
                          </div>
                        </div>
                        <h3 className="text-sm font-bold text-gray-500 mb-1">
                          {stat.name}
                        </h3>
                        <p className="text-2xl font-black text-gray-900">
                          {stat.value}
                        </p>
                        <p className="text-xs font-semibold text-gray-400 mt-2">
                          {stat.param}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Chart placeholder (simulated) */}
                    <div className="col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-900">
                          MRR 성장 추이 (최근 6개월)
                        </h2>
                        <select className="bg-gray-50 border-none text-sm font-medium rounded-lg text-gray-600 px-3 py-1 cursor-pointer">
                          <option>월별</option>
                          <option>주별</option>
                        </select>
                      </div>
                      <div className="w-full h-64 flex items-end justify-between gap-2">
                        {[30, 45, 60, 50, 75, 100].map((height, i) => (
                          <div
                            key={i}
                            className="w-full bg-brand-primary/10 rounded-t-lg relative group transition-all duration-300 hover:bg-brand-primary"
                            style={{ height: `${height}%` }}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              ₩{height * 12.45}만
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="w-full flex justify-between mt-4 text-xs font-bold text-gray-400">
                        <span>Oct</span>
                        <span>Nov</span>
                        <span>Dec</span>
                        <span>Jan</span>
                        <span>Feb</span>
                        <span>Mar</span>
                      </div>
                    </div>

                    {/* Recent Inquiries Quick View */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-900">
                          최근 도입 문의
                        </h2>
                        <button
                          onClick={() => setActiveTab("inquiries")}
                          className="text-sm font-bold text-brand-primary hover:underline"
                        >
                          모두 보기
                        </button>
                      </div>
                      <div className="flex-1 space-y-4">
                        {inquiries.length > 0 ? (
                          inquiries.slice(0, 4).map((inquiry) => (
                            <div
                              key={inquiry.id}
                              className="flex items-center gap-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0"
                            >
                              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                <Store className="w-4 h-4 text-emerald-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">
                                  {inquiry.salon_name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {inquiry.contact_name}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <span
                                  className={`text-[10px] font-bold px-2 py-1 rounded-md ${inquiry.status === "대기중" ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-600"}`}
                                >
                                  {inquiry.status}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">
                            최근 접수된 문의가 없습니다.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {activeTab === "inquiries" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 mb-2">
                    프리미엄 살롱 도입 문의 관리
                  </h1>
                  <p className="text-gray-500 font-medium">
                    B2B 영업 및 인바운드 문의를 트래킹합니다.
                  </p>
                </div>
                <button className="bg-brand-primary text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md transition-transform hover:scale-105 active:scale-95">
                  CSV 다운로드
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 font-bold uppercase tracking-wider">
                        <th className="p-5">살롱 (지점명)</th>
                        <th className="p-5">담당자</th>
                        <th className="p-5">연락처 / Email</th>
                        <th className="p-5">접수 일시</th>
                        <th className="p-5">상태 변경</th>
                        <th className="p-5">세부 내용</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {inquiries.length > 0 ? (
                        inquiries.map((inquiry) => (
                          <tr
                            key={inquiry.id}
                            className="hover:bg-gray-50/50 transition-colors group"
                          >
                            <td className="p-5 font-bold text-gray-900">
                              {inquiry.salon_name}
                            </td>
                            <td className="p-5 text-sm text-gray-700 font-medium">
                              {inquiry.contact_name}
                            </td>
                            <td className="p-5">
                              <p className="text-sm text-gray-900 font-medium">
                                {inquiry.phone}
                              </p>
                              <p className="text-xs text-gray-400">
                                {inquiry.email}
                              </p>
                            </td>
                            <td className="p-5 text-sm text-gray-500 flex flex-col gap-1">
                              <span>{formatDate(inquiry.created_at)}</span>
                            </td>
                            <td className="p-5">
                              <select
                                value={inquiry.status}
                                onChange={(e) =>
                                  updateInquiryStatus(
                                    inquiry.id,
                                    e.target.value,
                                  )
                                }
                                className={`text-[11px] font-bold px-2.5 py-1.5 rounded-md outline-none cursor-pointer ${
                                  inquiry.status === "대기중"
                                    ? "bg-red-50 text-red-600 border border-red-100 focus:ring-red-500"
                                    : inquiry.status === "상담완료"
                                      ? "bg-green-50 text-green-600 border border-green-100 focus:ring-green-500"
                                      : "bg-gray-100 text-gray-600 border border-gray-200 focus:ring-gray-500"
                                }`}
                              >
                                <option value="대기중">대기중</option>
                                <option value="상담완료">상담완료</option>
                                <option value="보류">보류</option>
                              </select>
                            </td>
                            <td className="p-5">
                              <button
                                className="text-sm font-bold text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() =>
                                  alert(
                                    `문의 상세 내용: \n\n${inquiry.details}`,
                                  )
                                }
                              >
                                상세보기{" "}
                                <ChevronRight className="w-4 h-4 inline-block" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="p-10 text-center text-gray-500"
                          >
                            조회된 도입 문의가 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "hair-styles" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 mb-2">
                    시술명(스타일) 관리
                  </h1>
                  <p className="text-gray-500 font-medium">
                    사용자가 선택할 수 있는 헤어스타일 이름을 성별로 관리합니다.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-6">
                  {editingStyleId ? "시술명 수정" : "새 시술명 등록"}
                </h2>
                <form
                  onSubmit={handleAddOrUpdateHairStyle}
                  className="max-w-2xl"
                >
                  <div className="flex flex-col md:flex-row gap-6 mb-6">
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        성별 카테고리
                      </label>
                      <select
                        value={newHairStyleGender}
                        onChange={(e) =>
                          setNewHairStyleGender(
                            e.target.value as "female" | "male",
                          )
                        }
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all text-sm font-medium"
                      >
                        <option value="female">여자 시술</option>
                        <option value="male">남자 시술</option>
                      </select>
                    </div>
                    <div className="flex-[2]">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        시술명
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="예: 레이어드 컷"
                        value={newHairStyleName}
                        onChange={(e) => setNewHairStyleName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-brand-primary text-white font-bold px-8 py-3 rounded-xl transition-transform hover:scale-105 active:scale-95 shadow-md flex items-center gap-2"
                    >
                      {editingStyleId ? (
                        <>
                          <CheckSquare className="w-5 h-5" />
                          수정 완료
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          시술명 등록
                        </>
                      )}
                    </button>
                    {editingStyleId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingStyleId(null);
                          setNewHairStyleName("");
                        }}
                        className="bg-gray-100 text-gray-600 font-bold px-8 py-3 rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        취소
                      </button>
                    )}
                  </div>
                </form>

              </div>

              {/* Style List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {["female", "male"].map((gender) => (
                  <div
                    key={gender}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                      <div
                        className={`p-2 rounded-lg ${gender === "female" ? "bg-pink-50 text-pink-500" : "bg-blue-50 text-blue-500"}`}
                      >
                        {gender === "female" ? "여성 시술" : "남성 시술"}
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        등록된 시술 내역
                      </h3>
                      <span className="ml-auto bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
                        {hairStyles.filter((s) => s.gender === gender).length}개
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {hairStyles.filter((s) => s.gender === gender).length ===
                      0 ? (
                        <div className="text-gray-400 text-sm py-4 text-center">
                          등록된 시술명이 없습니다.
                        </div>
                      ) : (
                        hairStyles
                          .filter((s) => s.gender === gender)
                          .map((style) => (
                            <div
                              key={style.id}
                              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-transparent transition-colors group"
                            >
                              <span className="text-sm font-bold text-gray-800">
                                {style.name}
                              </span>
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    setEditingStyleId(style.id);
                                    setNewHairStyleName(style.name);
                                    setNewHairStyleGender(
                                      style.gender as "female" | "male",
                                    );
                                    window.scrollTo({
                                      top: 0,
                                      behavior: "smooth",
                                    });
                                  }}
                                  className="p-1.5 text-indigo-500 hover:bg-white rounded-md shadow-sm border border-transparent hover:border-gray-200"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteHairStyle(style.id)
                                  }
                                  className="p-1.5 text-red-500 hover:bg-white rounded-md shadow-sm border border-transparent hover:border-gray-200"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "models" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 mb-2">
                    AI 모델 이미지 관리
                  </h1>
                  <p className="text-gray-500 font-medium">
                    사용 가능한 AI 헤어모델 프리셋 이미지를 추가하고 삭제합니다.
                  </p>
                </div>
              </div>

              {/* Add/Edit Model Form */}
              <div
                className={`rounded-2xl p-6 shadow-sm border mb-8 transition-colors ${editingModelId ? "bg-indigo-50/50 border-indigo-200" : "bg-white border-gray-100"}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className={`text-lg font-bold flex items-center gap-2 ${editingModelId ? "text-indigo-900" : "text-gray-900"}`}
                  >
                    {editingModelId ? (
                      <Edit2 className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <Plus className="w-5 h-5 text-gray-500" />
                    )}
                    {editingModelId ? "모델 정보 수정" : "새 모델 등록"}
                  </h2>
                  {editingModelId && (
                    <button
                      onClick={resetForm}
                      className="text-sm font-bold text-gray-500 hover:text-gray-900 bg-white px-3 py-1.5 rounded-lg border shadow-sm flex items-center gap-1.5"
                    >
                      <X className="w-4 h-4" /> 취소
                    </button>
                  )}
                </div>

                <form
                  onSubmit={handleAddOrUpdateModel}
                  className="flex flex-col lg:flex-row items-end gap-4"
                >
                  <div className="w-full lg:w-1/4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      카테고리
                    </label>
                    <select
                      value={newModelGender}
                      onChange={(e) =>
                        setNewModelGender(e.target.value as "female" | "male")
                      }
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-brand-primary/20 focus:border-brand-primary outline-none text-gray-700 font-semibold shadow-sm"
                    >
                      <option value="female">여성 (Female)</option>
                      <option value="male">남성 (Male)</option>
                    </select>
                  </div>
                  <div className="w-full lg:w-1/4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      설명 (예: 청순한 20대 여성)
                    </label>
                    <input
                      type="text"
                      value={newModelDesc}
                      onChange={(e) => setNewModelDesc(e.target.value)}
                      placeholder="설명을 입력하세요"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-brand-primary/20 focus:border-brand-primary outline-none shadow-sm"
                    />
                  </div>
                  <div className="w-full lg:w-2/4 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-semibold text-gray-700">
                        이미지 URL
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          multiple={!editingModelId}
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[0px]"
                          disabled={isUploadingImage}
                        />
                        <div
                          className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md transition-colors ${isUploadingImage ? "text-indigo-400 bg-indigo-50" : "text-indigo-600 bg-indigo-50 hover:bg-indigo-100 cursor-pointer pointer-events-none"}`}
                        >
                          {isUploadingImage ? (
                            <Activity className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          {isUploadingImage
                            ? "업로드 중..."
                            : editingModelId
                              ? "PC에서 1장 업로드/변경"
                              : "PC에서 다중 업로드 (바로 등록)"}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="url"
                        value={newModelUrl}
                        onChange={(e) => setNewModelUrl(e.target.value)}
                        placeholder="업로드하거나 직접 URL을 입력하세요"
                        required={!isUploadingImage}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-brand-primary/20 focus:border-brand-primary outline-none shadow-sm"
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingModel || isUploadingImage}
                        className={`font-bold h-[46px] px-6 rounded-xl text-sm shadow-md transition-transform whitespace-nowrap disabled:opacity-50 ${editingModelId ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-brand-primary hover:bg-brand-primary/90 text-white hover:scale-105 active:scale-95"}`}
                      >
                        {isSubmittingModel
                          ? "저장 중..."
                          : editingModelId
                            ? "변경사항 저장"
                            : "등록하기"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Models Filter & Bulk Actions */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 relative">
                <div className="flex items-center flex-wrap gap-4">
                  <div className="flex bg-gray-100 rounded-full p-1 w-max">
                    <button
                      onClick={() => setFilterGender("all")}
                      className={`px-5 py-1.5 rounded-full text-sm font-bold transition-colors ${filterGender === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}
                    >
                      전체 보기
                    </button>
                    <button
                      onClick={() => setFilterGender("female")}
                      className={`px-5 py-1.5 rounded-full text-sm font-bold transition-colors ${filterGender === "female" ? "bg-white text-pink-600 shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}
                    >
                      여성 모델
                    </button>
                    <button
                      onClick={() => setFilterGender("male")}
                      className={`px-5 py-1.5 rounded-full text-sm font-bold transition-colors ${filterGender === "male" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}
                    >
                      남성 모델
                    </button>
                  </div>
                  {filteredModels.length > 0 && (
                    <button
                      onClick={() =>
                        handleSelectAll(filteredModels.map((m) => m.id))
                      }
                      className="text-sm font-bold text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg border bg-white shadow-sm flex items-center gap-2 transition-colors"
                    >
                      {selectedModelIds.length === filteredModels.length ? (
                        <CheckSquare className="w-4 h-4 text-brand-primary" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                      {selectedModelIds.length === filteredModels.length
                        ? "선택 해제"
                        : "현재 화면 전체 선택"}
                    </button>
                  )}
                </div>

                {selectedModelIds.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-900 text-white rounded-xl py-2 px-4 flex items-center justify-between gap-6 shadow-lg z-30"
                  >
                    <div className="flex items-center gap-2">
                      <span className="bg-white/20 text-xs font-bold px-2 py-0.5 rounded text-white">
                        {selectedModelIds.length}
                      </span>
                      <span className="text-sm font-bold whitespace-nowrap">
                        개 선택됨
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-white/10 rounded-lg p-1 mr-1">
                        <button
                          onClick={() => handleBulkChangeCategory("female")}
                          className="text-xs font-bold px-3 py-1.5 rounded-md hover:bg-white/20 transition-colors"
                        >
                          여성으로 변경
                        </button>
                        <button
                          onClick={() => handleBulkChangeCategory("male")}
                          className="text-xs font-bold px-3 py-1.5 rounded-md hover:bg-white/20 transition-colors"
                        >
                          남성으로 변경
                        </button>
                      </div>
                      <div className="w-px h-6 bg-white/20"></div>
                      <button
                        onClick={handleBulkDelete}
                        className="text-red-400 hover:text-red-300 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-bold text-sm"
                        title="일괄 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                        삭제
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={filteredModels.map((m) => m.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredModels.map((model) => (
                      <SortableModelCard
                        key={model.id}
                        model={model}
                        isSelected={selectedModelIds.includes(model.id)}
                        onToggleSelect={toggleModelSelection}
                        onEditClick={handleEditClick}
                        onDeleteClick={handleDeleteModel}
                      />
                    ))}

                    {filteredModels.length === 0 && (
                      <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-gray-100 border-dashed">
                        <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">
                          선택된 카테고리에 등록된 AI 모델 이미지가 없습니다.
                        </p>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </motion.div>
          )}

          {activeTab === "users" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 mb-2">
                    디자이너 / 점주 계정 관리
                  </h1>
                  <p className="text-gray-500 mb-0 font-medium">
                    B2C 및 개인 디자이너, 살롱 점주 가입자 목록입니다.
                  </p>
                </div>
                <div className="flex items-center gap-3 justify-end shrink-0">
                  <button onClick={() => {
                    const headers = ["이름", "이메일", "크레딧 잔액", "구독 플랜", "영업 상태", "가입일"];
                    const csvContent = [
                      headers.join(","),
                      ...profiles
                        .filter(p => !['admin', 'operator', 'security_admin', 'cs_admin', 'system_admin'].includes(p.role || ''))
                        .map(p => [
                        `"${p.full_name || ''}"`,
                        `"${maskEmailForExport(p.email || '')}"`,
                        `${p.credits || 0}`,
                        `"${p.subscription_plan || '무료회원'}"`,
                        `"${!p.business_status || p.business_status === 'active' ? '정상영업' : p.business_status === 'dormant' ? '휴면' : '휴/폐업'}"`,
                        `"${new Date(p.created_at).toLocaleDateString()}"`
                      ].join(","))
                    ].join("\n");
                    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `subscriber_list_${new Date().toISOString().slice(0, 10)}.csv`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    try {
                      logPrivacyAction('EXPORT', 'profiles', 'ALL', { source: 'AdminPage_Excel_Export', count: profiles.length });
                    } catch (e) {}
                  }} className="px-3 py-2 bg-green-50 text-green-700 font-bold rounded-xl text-sm border-2 border-green-100 hover:bg-green-100 transition-colors">
                    Excel 다운로드
                  </button>
                  <button onClick={() => window.print()} className="px-3 py-2 bg-gray-50 text-gray-700 font-bold rounded-xl text-sm border-2 border-gray-100 hover:bg-gray-100 transition-colors">
                    프린트
                  </button>
                  <button
                    onClick={() => fetchData()}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-2"
                  >
                    <Activity className="w-4 h-4" />
                    목록 새로고침
                  </button>
                  <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-500">
                      총 가입자:
                    </span>
                    <span className="text-lg font-black text-brand-primary">
                      {profiles.filter(p => !p.role || p.role === 'user').length}명
                    </span>
                  </div>
                </div>
              </div>

              {/* Business Status Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-500 mb-1">정상 영업중</p>
                    <p className="text-2xl font-black text-gray-900">
                      {profiles.filter(p => (!p.role || p.role === 'user') && (!p.business_status || p.business_status === 'active')).length}
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
                      {profiles.filter(p => (!p.role || p.role === 'user') && p.business_status === 'dormant').length}
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
                      {profiles.filter(p => (!p.role || p.role === 'user') && p.business_status === 'closed').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                    <X className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 font-bold uppercase tracking-wider">
                        <th className="p-5">사용자</th>
                        <th className="p-5">이메일</th>
                        {hasCreditsColumn && <th className="p-5">크레딧 관리</th>}
                        <th className="p-5">가입 일시</th>
                        <th className="p-5">이용 상태</th>
                        <th className="p-5 text-right">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {profiles.filter(p => !p.role || p.role === 'user').length > 0 ? (
                        profiles.filter(p => !p.role || p.role === 'user').map((profile) => (
                          <tr
                            key={profile.id}
                            className={`hover:bg-gray-50/50 transition-colors group ${profile.is_blacklisted ? "opacity-60 bg-red-50/30" : ""}`}
                          >
                            <td className="p-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold overflow-hidden">
                                  {profile.avatar_url ? (
                                    <img
                                      src={profile.avatar_url}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    profile.full_name?.substring(0, 1) ||
                                    profile.email?.substring(0, 1)?.toUpperCase() || "U"
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-gray-900 truncate flex items-center gap-2 flex-wrap">
                                    <span>{profile.full_name || "이름 없음"}</span>
                                    {(() => {
                                      const providerVal = (profile.provider || '').toLowerCase();
                                      const signedByVal = (profile.signedBy || '').toLowerCase();
                                      const loginTypeVal = (profile.loginType || '').toLowerCase();
                                      const snsTypeVal = (profile.snsType || '').toLowerCase();
                                      const emailVal = (profile.email || '').toLowerCase();
                                      
                                      const isKakao = providerVal === 'kakao' || 
                                                      signedByVal === 'kakao' || 
                                                      loginTypeVal === 'kakao' || 
                                                      snsTypeVal === 'kakao' || 
                                                      emailVal.includes('kakao.social') || 
                                                      emailVal.includes('kakao_') || 
                                                      emailVal.endsWith('@kakao.com');
                                      
                                      const isNaver = providerVal === 'naver' || 
                                                      signedByVal === 'naver' || 
                                                      loginTypeVal === 'naver' || 
                                                      snsTypeVal === 'naver' || 
                                                      emailVal.includes('naver.social') || 
                                                      emailVal.includes('naver_') || 
                                                      emailVal.endsWith('@naver.com');
                                      
                                      const isGoogle = providerVal === 'google' || 
                                                       signedByVal === 'google' || 
                                                       loginTypeVal === 'google' || 
                                                       snsTypeVal === 'google' || 
                                                       emailVal.includes('google.social') || 
                                                       emailVal.includes('google_') || 
                                                       emailVal.includes('gmail');
                                      
                                      const isPhone = providerVal === 'phone' || 
                                                      signedByVal === 'phone' || 
                                                      loginTypeVal === 'phone' || 
                                                      snsTypeVal === 'phone' || 
                                                      emailVal.includes('social.user') || 
                                                      emailVal.endsWith('.local') || 
                                                      !emailVal || 
                                                      !emailVal.includes('@');
                                      
                                      if (isGoogle) {
                                        return (
                                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-red-50 text-red-600 border border-red-100 shrink-0">
                                            구글
                                          </span>
                                        );
                                      } else if (isKakao) {
                                        return (
                                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-yellow-50 text-yellow-800 border border-yellow-100 shrink-0">
                                            카카오
                                          </span>
                                        );
                                      } else if (isNaver) {
                                        return (
                                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                                            네이버
                                          </span>
                                        );
                                      } else if (isPhone) {
                                        return (
                                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                                            휴대폰번호
                                          </span>
                                        );
                                      } else {
                                        return (
                                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
                                            이메일
                                          </span>
                                        );
                                      }
                                    })()}
                                    {profile.is_blacklisted && (
                                      <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-sm outline outline-1 outline-red-200">
                                        정지됨
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-[10px] text-gray-400 font-mono truncate">
                                    {profile.id}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-5 text-sm font-medium text-gray-600">
                              {profile.email}
                            </td>
                            {hasCreditsColumn && (
                              <td className="p-5">
                                {selectedProfileId === profile.id ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      value={adjustAmount}
                                      onChange={(e) =>
                                        setAdjustAmount(
                                          parseInt(e.target.value) || 0,
                                        )
                                      }
                                      className="w-20 border-2 border-brand-primary/30 rounded-lg px-2 py-1 text-sm outline-none focus:border-brand-primary"
                                      placeholder="+/-"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() =>
                                        handleAdjustUserCreditsFromList(
                                          profile.id,
                                          profile.credits,
                                        )
                                      }
                                      className="text-xs bg-brand-primary text-white px-3 py-1.5 rounded-lg font-bold shadow-sm"
                                      disabled={adjustingCredits}
                                    >
                                      {adjustingCredits ? "..." : "적용"}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedProfileId(null);
                                        setAdjustAmount(0);
                                      }}
                                      className="text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg font-bold hover:bg-gray-200"
                                    >
                                      취소
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <div className="bg-indigo-50 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                      <Coins className="w-3.5 h-3.5 text-brand-primary" />
                                      <span className="text-sm font-black text-brand-primary leading-none">
                                        {(profile.credits || 0).toLocaleString()}{" "}
                                        C
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => {
                                        setSelectedProfileId(profile.id);
                                        setAdjustAmount(0);
                                      }}
                                      className="text-xs text-gray-400 hover:text-brand-primary hover:underline font-bold transition-colors"
                                    >
                                      조정하기
                                    </button>
                                  </div>
                                )}
                              </td>
                            )}
                            <td className="p-5 text-sm text-gray-500">
                              {profile.ncp_synced && profile.created_at
                                ? formatDate(profile.created_at)
                                : "null"}
                            </td>
                            <td className="p-5">
                              <button
                                onClick={() => toggleBusinessStatus(profile.id, profile.business_status)}
                                className={`text-xs px-2.5 py-1 rounded-md font-bold transition-colors ${
                                  !profile.business_status || profile.business_status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                                  profile.business_status === 'dormant' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' :
                                  'bg-red-100 text-red-700 hover:bg-red-200'
                                }`}
                                title="상태 변경 (영업중 -> 미사용/휴면 -> 폐업)"
                              >
                                {!profile.business_status || profile.business_status === 'active' ? '영업/사용중' :
                                 profile.business_status === 'dormant' ? '장기 미사용' :
                                 '휴·폐업'}
                              </button>
                            </td>
                            <td className="p-5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  title="디자이너 추가 정보"
                                  onClick={() => fetchDesignerDetail(profile)}
                                  className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <UserCircle className="w-4 h-4" />
                                </button>
                                <button
                                  title="크레딧 이용내역"
                                  onClick={() =>
                                    fetchUserHistory(
                                      profile.id,
                                      profile.full_name || profile.email,
                                    )
                                  }
                                  className="text-indigo-500 hover:text-indigo-700 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                                >
                                  <History className="w-4 h-4" />
                                </button>
                                <button
                                  title={
                                    profile.is_blacklisted
                                      ? "정지 해제"
                                      : "정지(블랙리스트)"
                                  }
                                  onClick={() =>
                                    toggleBlacklist(
                                      profile.id,
                                      !!profile.is_blacklisted,
                                    )
                                  }
                                  className={`p-2 rounded-lg transition-colors ${profile.is_blacklisted ? "text-green-500 hover:bg-green-50" : "text-orange-500 hover:bg-orange-50"}`}
                                >
                                  <X className="w-4 h-4" />
                                </button>
                                <button
                                  title="회원 삭제"
                                  onClick={() => handleDeleteUser(profile.id)}
                                  className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-20 text-center">
                            <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">
                              가입된 사용자가 없습니다.
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "admins" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 mb-2">
                    내부 직원 / 관리자 계정 관리
                  </h1>
                  <p className="text-gray-500 mb-0 font-medium">
                    플랫폼 운영에 참여하는 관리자, CS, 보안, 운영자 계정의 권한 및 재직 상태를 관리합니다.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={async () => {
                      const email = window.prompt("관리자로 승인할 사용자의 이메일을 입력하세요:");
                      if (email) {
                        let user = profiles.find(p => p.email === email);
                        if (!user) {
                          // Try fetching from DB if not in current profiles state
                          const { data, error } = await supabase
                            .from('profiles')
                            .select('id, email, full_name')
                            .eq('email', email)
                            .single();
                          if (data) {
                            user = data;
                          } else {
                            console.error("DB User check failed:", error);
                          }
                        }

                        if (user) {
                          updateUserRole(user.id, "operator");
                          alert(`${email} 계정이 운영자(operator) 권한으로 승인되었습니다.`);
                          // Refresh data to show the new admin
                          fetchData();
                        } else {
                          alert("해당 이메일의 가입자를 찾을 수 없습니다. 먼저 사용자가 서비스에 가입해야 합니다.");
                        }
                      }
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    신규 관리자 임명
                  </button>
                  <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-500">
                      총 관리계정:
                    </span>
                    <span className="text-lg font-black text-indigo-600">
                      {profiles.filter(p => p.role && p.role !== 'user').length}개
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-sm font-bold text-gray-500 mb-1">최고 관리자</p>
                  <p className="text-2xl font-black text-gray-900">
                    {profiles.filter(p => p.role === 'system_admin').length}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-sm font-bold text-gray-500 mb-1">보안 관리자 (ISMS)</p>
                  <p className="text-2xl font-black text-indigo-600">
                    {profiles.filter(p => p.role === 'security_admin').length}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-sm font-bold text-gray-500 mb-1">운영/CS 담당자</p>
                  <p className="text-2xl font-black text-emerald-600">
                    {profiles.filter(p => p.role === 'operator' || p.is_cs_admin).length}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-sm font-bold text-gray-500 mb-1">휴면/퇴사 계정</p>
                  <p className="text-2xl font-black text-red-600">
                    {profiles.filter(p => p.role && p.role !== 'user' && (p.business_status === 'dormant' || p.business_status === 'closed')).length}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 font-bold uppercase tracking-wider">
                        <th className="p-5">관리자 정보</th>
                        <th className="p-5">시스템 권한 (Role)</th>
                        <th className="p-5">CS 권한</th>
                        <th className="p-5">재직/계약 상태</th>
                        <th className="p-5">최근 접속/가입</th>
                        <th className="p-5 text-right">계정 관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {profiles.filter(p => p.role && p.role !== 'user').length > 0 ? (
                        profiles.filter(p => p.role && p.role !== 'user').map((profile) => (
                          <tr
                            key={profile.id}
                            className={`hover:bg-gray-50/50 transition-colors group ${profile.is_blacklisted ? "opacity-60 bg-red-50/30" : ""}`}
                          >
                            <td className="p-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold overflow-hidden">
                                  {profile.avatar_url ? (
                                    <img
                                      src={profile.avatar_url}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    profile.full_name?.substring(0, 1) || "A"
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-gray-900 truncate">
                                    {profile.full_name || "관리자"}
                                  </p>
                                  <p className="text-[11px] text-gray-500 truncate">
                                    {profile.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-5">
                              <select 
                                value={profile.role || 'user'} 
                                onChange={(e) => updateUserRole(profile.id, e.target.value)}
                                className={`text-xs px-2.5 py-1.5 rounded-lg font-bold border-2 outline-none transition-all
                                  ${profile.role === 'system_admin' ? 'bg-red-50 text-red-700 border-red-100' :
                                    profile.role === 'security_admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                    'bg-emerald-50 text-emerald-700 border-emerald-100'}`}
                              >
                                <option value="operator">운영자(마케팅/운영)</option>
                                <option value="security_admin">보안 관리자(ISMS)</option>
                                <option value="system_admin">최고 관리자</option>
                                <option value="user">일반 사용자로 강등</option>
                              </select>
                            </td>
                            <td className="p-5">
                              <button
                                onClick={() => toggleCsAdmin(profile.id, !!profile.is_cs_admin)}
                                className={`text-[11px] px-3 py-1.5 rounded-lg font-bold transition-all border ${
                                  profile.is_cs_admin 
                                    ? "bg-purple-50 text-purple-700 border-purple-200" 
                                    : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
                                }`}
                              >
                                {profile.is_cs_admin ? "CS 접근 활성" : "CS 권한 없음"}
                              </button>
                            </td>
                            <td className="p-5">
                              <select 
                                value={profile.business_status || 'active'} 
                                onChange={(e) => updateBusinessStatus(profile.id, e.target.value as any)}
                                className={`text-[11px] px-2 py-1 rounded-md font-bold border outline-none
                                  ${profile.business_status === 'dormant' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                    profile.business_status === 'closed' ? 'bg-red-50 text-red-600 border-red-100' :
                                    'bg-green-50 text-green-600 border-green-100'}`}
                              >
                                <option value="active">재직 중 (정상)</option>
                                <option value="dormant">휴면 계정</option>
                                <option value="closed">퇴사 / 계약종료</option>
                              </select>
                            </td>
                            <td className="p-5 text-[11px] text-gray-500 leading-tight">
                              <div>가입: {profile.created_at ? formatDate(profile.created_at) : "-"}</div>
                              <div className="mt-1">접속: {profile.last_login_at ? formatDate(profile.last_login_at) : "기록없음"}</div>
                            </td>
                            <td className="p-5 text-right">
                              <div className="flex justify-end gap-2">
                                {profile.email !== "cubric.ceo@gmail.com" && (
                                  <button
                                    onClick={() => toggleBlacklist(profile.id, !!profile.is_blacklisted)}
                                    className={`p-2 rounded-lg transition-colors border ${profile.is_blacklisted ? "text-green-500 bg-green-50 border-green-200" : "text-orange-500 bg-white border-orange-200 hover:bg-orange-50"}`}
                                    title={profile.is_blacklisted ? "접근 제한 해제" : "시스템 접근 즉시 차단"}
                                  >
                                    <Lock className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteUser(profile.id)}
                                  className="text-red-500 hover:text-red-700 p-2 bg-white hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                                  title="계정 영구 삭제"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-20 text-center">
                            <Shield className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">관리자 계정이 존재하지 않습니다.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "logs" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 mb-2">
                    방문자 로그
                  </h1>
                  <p className="text-gray-500 font-medium">
                    최근 웹 접속 사용자 상세 로그 및 정책을 설정합니다.
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-white px-5 py-4 rounded-2xl shadow-sm border border-gray-100">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      동일 IP 방문 수 중복 카운트 방지
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      ON 상태일 시 1일 1회만 카운트 증가
                    </p>
                  </div>
                  <button
                    onClick={togglePreventDuplicateIp}
                    className="ml-4 focus:outline-none transition-transform hover:scale-105 active:scale-95"
                  >
                    {preventDuplicateIp ? (
                      <ToggleRight className="w-10 h-10 text-brand-primary" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-gray-300" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {logsError ? (
                  <div className="p-16 text-center">
                    <Globe className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      로그 데이터베이스 오류
                    </h3>
                    <p className="text-gray-500 whitespace-pre-wrap">
                      {logsError}
                    </p>
                  </div>
                ) : visitorLogs.length === 0 ? (
                  <div className="p-16 text-center">
                    <Globe className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      접속 로그가 없습니다.
                    </h3>
                    <p className="text-gray-500">
                      아직 수집된 방문 기록이 없습니다.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-sm font-bold text-gray-600">
                          <th className="p-4 whitespace-nowrap">방문일시</th>
                          <th className="p-4 whitespace-nowrap">IP 주소</th>
                          <th className="p-4 whitespace-nowrap">추정 위치</th>
                          <th className="p-4">유입 경로</th>
                          <th className="p-4">OS / 디바이스 (User Agent)</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-gray-100 text-gray-700">
                        {visitorLogs.map((log) => (
                          <tr
                            key={log.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="p-4 whitespace-nowrap font-medium">
                              {new Date(log.visited_at).toLocaleString("ko-KR")}
                            </td>
                            <td className="p-4 whitespace-nowrap">
                              <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded font-mono text-xs">
                                {log.ip_address}
                              </span>
                            </td>
                            <td className="p-4 whitespace-nowrap">
                              <button
                                onClick={() => log.latitude && log.longitude && setSelectedMapLog(log)}
                                className={`flex items-center gap-1.5 transition-colors ${log.latitude && log.longitude ? 'text-blue-600 hover:text-blue-800' : 'text-gray-500 cursor-default'}`}
                                disabled={!log.latitude || !log.longitude}
                              >
                                {log.latitude && log.longitude ? <MapPin className="w-4 h-4" /> : null}
                                <span className={log.latitude && log.longitude ? "underline underline-offset-2" : ""}>
                                  {log.location}
                                </span>
                              </button>
                            </td>
                            <td
                              className="p-4 max-w-[200px] truncate"
                              title={log.referrer}
                            >
                              {log.referrer.length > 50
                                ? log.referrer.substring(0, 50) + "..."
                                : log.referrer}
                            </td>
                            <td
                              className="p-4 max-w-[300px] truncate text-xs text-gray-500"
                              title={log.user_agent}
                            >
                              {log.user_agent}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "subscriptions" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl font-black text-gray-900 mb-2">
                구독 및 결제 관리
              </h1>
              <p className="text-gray-500 mb-8 font-medium">
                요금제별 결제 현황 및 인보이스, PG 연동 정책을 관리합니다.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* PG Setting Box */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        토스페이먼츠 연동 (PG)
                      </h3>
                      <p className="text-sm text-gray-500">
                        클라이언트 및 시크릿 키를 설정하여 결제를 활성화합니다.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Client Key (클라이언트 키)
                      </label>
                      <input
                        type="text"
                        value={pgClientKey}
                        onChange={(e) => setPgClientKey(e.target.value)}
                        placeholder="test_ck_..."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Secret Key (시크릿 키)
                      </label>
                      <input
                        type="text"
                        value={pgSecretKey}
                        onChange={(e) => setPgSecretKey(e.target.value)}
                        placeholder="test_sk_..."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                      />
                    </div>
                    <button
                      onClick={handleSavePgSettings}
                      disabled={savingPg}
                      className="w-full py-3 bg-brand-primary text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                    >
                      {savingPg ? "저장 중..." : "PG 연동 설정 저장"}
                    </button>
                    <p className="text-xs text-center text-gray-400 mt-2">
                      저장된 설정은 데이터베이스에 안전하게 보관되며, 서버와 클라이언트에서 자동으로 불러옵니다.
                    </p>
                  </div>
                </div>

                {/* Subscriptions Stats */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">구독 요약</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-6 rounded-2xl">
                      <p className="text-xs font-bold text-blue-500 uppercase mb-1">활성 구독</p>
                      <p className="text-3xl font-black text-blue-900">
                        {profiles.filter(p => p.subscription_status === 'active').length}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-6 rounded-2xl">
                      <p className="text-xs font-bold text-purple-500 uppercase mb-1">카드 등록됨</p>
                      <p className="text-3xl font-black text-purple-900">
                        {profiles.filter(p => p.billing_key).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscribed Users Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-900">전체 구독자 및 카드 등록 현황</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 font-bold uppercase tracking-wider">
                        <th className="p-5">사용자</th>
                        <th className="p-5">현재 플랜</th>
                        <th className="p-5">상태</th>
                        <th className="p-5">Billing Key 보유</th>
                        <th className="p-5">다음 결제 예정일</th>
                        <th className="p-5 text-right">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {profiles.filter(p => p.subscription_plan || p.billing_key).map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold">
                                {p.full_name?.substring(0,1) || 'U'}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">{p.full_name || '이름 없음'}</p>
                                <p className="text-xs text-gray-400">{p.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-5">
                            <span className={`px-3 py-1 rounded-full text-xs font-black ${
                              p.subscription_plan === 'Business' ? 'bg-amber-100 text-amber-700' :
                              p.subscription_plan === 'Pro' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {p.subscription_plan || 'N/A'}
                            </span>
                          </td>
                          <td className="p-5">
                             <span className={`flex items-center gap-1.5 text-xs font-bold ${
                               p.subscription_status === 'active' ? 'text-green-500' : 'text-gray-400'
                             }`}>
                               <div className={`w-1.5 h-1.5 rounded-full ${p.subscription_status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                               {p.subscription_status === 'active' ? '정상 이용 중' : '비활성'}
                             </span>
                          </td>
                          <td className="p-5">
                             {p.billing_key ? (
                               <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs bg-indigo-50 px-2 py-1 rounded-lg w-fit">
                                 <CheckSquare className="w-3.5 h-3.5" />
                                 보유 중
                               </div>
                             ) : (
                               <span className="text-gray-300 text-xs">미등록</span>
                             )}
                          </td>
                          <td className="p-5 text-sm text-gray-500 font-medium font-mono">
                            {p.subscription_end_date ? formatDate(p.subscription_end_date) : '-'}
                          </td>
                          <td className="p-5 text-right">
                             <div className="flex items-center justify-end gap-3">
                               <button 
                                 onClick={async () => {
                                   if(!window.confirm('이 사용자의 구독을 30일 연장하시겠습니까?')) return;
                                   const currentEnd = p.subscription_end_date ? new Date(p.subscription_end_date) : new Date();
                                   const newEnd = new Date(currentEnd.setMonth(currentEnd.getMonth() + 1)).toISOString();
                                   await supabase.from('profiles').update({ 
                                     subscription_status: 'active', 
                                     subscription_end_date: newEnd 
                                   }).eq('id', p.id);
                                   try {
                                     await logPrivacyAction('UPDATE', 'profiles', p.id, { source: 'AdminPage_ExtendSubscription', newEnd });
                                   } catch (e) {}
                                   fetchData();
                                 }}
                                 className="text-xs text-indigo-600 font-bold hover:underline"
                               >
                                 30일 연장
                               </button>
                               <button 
                                 onClick={async () => {
                                   if(!window.confirm('이 사용자의 구독을 강제로 만료시키겠습니까?')) return;
                                   await supabase.from('profiles').update({ subscription_status: 'inactive', subscription_plan: null }).eq('id', p.id);
                                   try {
                                     await logPrivacyAction('UPDATE', 'profiles', p.id, { source: 'AdminPage_CancelSubscription' });
                                   } catch (e) {}
                                   fetchData();
                                 }}
                                 className="text-xs text-red-500 font-bold hover:underline"
                               >
                                 구독 만료
                               </button>
                             </div>
                          </td>
                        </tr>
                      ))}
                      {profiles.filter(p => p.subscription_plan || p.billing_key).length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-20 text-center text-gray-500 font-medium">
                             아직 구독자 또는 등록된 카드가 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "credits" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 mb-2">
                    크레딧 관리{" "}
                  </h1>
                  <p className="text-gray-500 font-medium">
                    전체 크레딧 통계와 정책, 그리고 사용자별 크레딧을
                    관리합니다.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-brand-primary" />
                    크레딧 매출 통계(총 누적)
                  </h2>
                  <div className="text-4xl font-black text-gray-900 mb-2">
                    ₩{totalCreditRevenue.toLocaleString()}
                  </div>
                  <p className="text-sm font-bold text-gray-500 mb-6">
                    크레딧 패키지 및 단건 결제로 발생한 실제 누적 매출액
                  </p>
                </div>

                <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 p-8 rounded-2xl shadow-sm relative overflow-hidden text-white flex flex-col">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                  <h2 className="text-lg font-bold text-indigo-100 mb-6 relative z-10 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    크레딧 사용 순위 (TOP 3)
                  </h2>

                  <div className="space-y-4 relative z-10 flex-1 flex flex-col justify-center">
                    {creditRanking.length > 0 ? (
                      creditRanking.map((u, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center bg-white/10 p-3 rounded-xl border border-white/5"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-yellow-400 text-yellow-900" : "bg-white/20 text-white"}`}
                            >
                              {i + 1}
                            </span>
                            <span className="text-sm font-medium">
                              {u.email}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-indigo-200">
                            {u.spent} C
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-indigo-200 text-sm text-center py-4">
                        사용 내역이 없습니다.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Policy Settings */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-gray-400" />
                    시스템 크레딧 정책 설정
                  </h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          일일 로그인 보상 크레딧
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={dailyCreditReward}
                            onChange={(e) =>
                              setDailyCreditReward(parseInt(e.target.value) || 0)
                            }
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary font-bold"
                          />
                          <span className="font-bold text-gray-500 whitespace-nowrap text-xs">
                            C
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          첫 가입 보상 크레딧
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={welcomeCreditReward}
                            onChange={(e) =>
                              setWelcomeCreditReward(parseInt(e.target.value) || 0)
                            }
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary font-bold"
                          />
                          <span className="font-bold text-gray-500 whitespace-nowrap text-xs">
                            C
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2 border-b border-gray-100 mb-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          추천 가입 보상 (추천인에게)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={referralSignupReward}
                            onChange={(e) =>
                              setReferralSignupReward(parseInt(e.target.value) || 0)
                            }
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary font-bold"
                          />
                          <span className="font-bold text-gray-500 whitespace-nowrap text-xs">C</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          추천 활동 보상 (피추천인 생성시)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={referralActivityReward}
                            onChange={(e) =>
                              setReferralActivityReward(parseInt(e.target.value) || 0)
                            }
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary font-bold"
                          />
                          <span className="font-bold text-gray-500 whitespace-nowrap text-xs">C</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        AI 모델 1회 생성 비용
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={generationCreditCost}
                          onChange={(e) =>
                            setGenerationCreditCost(
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary font-bold"
                        />
                        <span className="font-bold text-gray-500 whitespace-nowrap">
                          Credits
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleSaveCreditSettings}
                      disabled={savingCredits}
                      className="w-full bg-brand-primary text-white font-bold py-3 rounded-xl transition-all hover:bg-brand-primary/90 disabled:opacity-50"
                    >
                      {savingCredits ? "저장 중..." : "정책 저장하기"}
                    </button>
                  </div>
                </div>

                {/* User Adjustment */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col">
                  <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-400" />
                    개별 사용자 설정
                  </h2>
                  <div className="space-y-6 flex-1">

                    <div className="relative" ref={emailDropdownRef}>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                         대상 사용자 이메일
                      </label>
                      <input
                        type="email"
                        value={creditSearchEmail}
                        onFocus={() => setIsEmailDropdownOpen(true)}
                        onChange={(e) => {
                          setCreditSearchEmail(e.target.value);
                          setIsEmailDropdownOpen(true);
                        }}
                        placeholder="이메일을 입력하거나 목록에서 선택하세요"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary font-medium"
                      />
                      
                      <AnimatePresence>
                        {isEmailDropdownOpen && filteredEmails.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-[60] left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto"
                          >
                            {filteredEmails.map((email, i) => (
                              <button
                                key={email + i}
                                type="button"
                                onClick={() => {
                                  setCreditSearchEmail(email);
                                  setIsEmailDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium text-gray-700 border-b border-gray-50 last:border-0"
                              >
                                {email}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        크레딧 증감량 (차감 시 - 기호 활용)
                      </label>
                      <input
                        type="number"
                        value={creditAdjustment}
                        onChange={(e) => setCreditAdjustment(e.target.value)}
                        placeholder="예: 50, -10"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary font-bold"
                      />
                    </div>
                    <button
                      onClick={handleAdjustUserCredits}
                      className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl transition-all hover:bg-gray-800 mt-auto"
                    >
                      반영하기
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "integrations" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 mb-2">
                    API 연동 설정
                  </h1>
                  <p className="text-gray-500 font-medium">
                    외부 서비스 API URL 및 키를 설정하세요
                  </p>
                </div>
              </div>

              <div className="flex gap-4 border-b border-gray-200 mb-6">
                <button
                  onClick={() => setIntegrationTab("aistudio")}
                  className={`px-4 py-3 font-bold border-b-2 transition-all ${integrationTab === "aistudio" ? "border-brand-primary text-brand-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                >
                  AI Studio API Keys
                </button>
                <button
                  onClick={() => setIntegrationTab("gemini")}
                  className={`px-4 py-3 font-bold border-b-2 transition-all ${integrationTab === "gemini" ? "border-brand-primary text-brand-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                >
                  Gemini API Keys
                </button>
              </div>

              {integrationTab === "aistudio" && (
                <div className="bg-white border text-left border-gray-200 rounded-2xl overflow-hidden mb-8">
                  <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="p-2 bg-brand-primary/10 rounded-lg">
                      <Globe className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        AI Studio API Keys (NCP / Custom)
                      </h2>
                      <p className="text-sm text-gray-500">
                        GPU 서버(NCP 등)에 구축한 AI Studio API(FaceFusion 등) 주소를 입력하세요
                      </p>
                    </div>
                  </div>
                  <div className="p-6 bg-gray-50/50">
                    <div className="max-w-xl mx-auto py-4">
                      <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          API URL (IP주소 및 포트)
                        </label>
                        <input
                          type="url"
                          value={facefusionUrl}
                          onChange={(e) => setFacefusionUrl(e.target.value)}
                          placeholder="http://111.111.111.111:7860"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                          * http:// 또는 https:// 가 포함된 전체 URL 형태로 입력해주세요.<br/>
                          * 예시: http://my-ncp-server-ip:7860<br/>
                          * 값이 비어있다면 .env 파일의 VITE_FACEFUSION_API_URL 접속을 시도합니다.
                        </p>
                      </div>

                      <div className="flex justify-end pt-4">
                        <button
                          onClick={handleSaveIntegrationsSettings}
                          disabled={savingSettings}
                          className="px-6 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          {savingSettings ? "저장 중..." : "설정 저장"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {integrationTab === "gemini" && (
                <GeminiApiKeyManager />
              )}
            </motion.div>
          )}

        </div>
      </main>

      {/* Credit History Modal */}
      <AnimatePresence>
        {viewHistoryUserId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewHistoryUserId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[80vh]"
            >
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {viewHistoryUserName}님의 이용 내역
                  </h2>
                  <p className="text-xs text-gray-400 font-medium">{viewHistoryUserId}</p>
                </div>
                <button
                  onClick={() => setViewHistoryUserId(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                {loadingHistory ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Activity className="w-8 h-8 text-indigo-500 animate-spin" />
                    <p className="text-gray-500 font-medium">내역을 불러오는 중...</p>
                  </div>
                ) : userHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <History className="w-12 h-12 text-gray-200" />
                    <p className="text-gray-500 font-medium">사용 내역이 없습니다.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userHistory.map((t) => (
                      <div
                        key={t.id}
                        className="flex justify-between items-center p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:border-indigo-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${t.type === "earned" ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"}`}
                          >
                            {t.type === "earned" ? (
                              <Plus className="w-5 h-5" />
                            ) : (
                              <ArrowRight className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{t.description}</p>
                            <p className="text-xs text-gray-400 font-mono">
                              {new Date(t.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-black text-lg ${t.type === "earned" ? "text-green-500" : "text-red-500"}`}
                          >
                            {t.type === "earned" ? "+" : "-"}{t.amount.toLocaleString()}
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {t.type === "earned" ? "Credit In" : "Credit Out"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setViewHistoryUserId(null)}
                  className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Designer Detail Modal */}
      <AnimatePresence>
        {selectedDesignerDetail && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDesignerDetail(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
            >
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                     {selectedDesignerDetail.profileImageUrl ? (
                       <img src={selectedDesignerDetail.profileImageUrl} alt="profile" className="w-full h-full object-cover" />
                     ) : (
                       <UserCircle className="w-full h-full text-gray-400 p-2" />
                     )}
                   </div>
                   <div>
                     <div className="flex items-center gap-2 flex-wrap mb-1">
                       <h2 className="text-xl font-bold text-gray-900 leading-none">
                         {selectedDesignerDetail.name} <span className="font-medium text-sm text-gray-500 text-left">님 정보</span>
                       </h2>
                       {(() => {
                         const providerVal = (selectedDesignerDetail.provider || '').toLowerCase();
                         const signedByVal = (selectedDesignerDetail.signedBy || '').toLowerCase();
                         const loginTypeVal = (selectedDesignerDetail.loginType || '').toLowerCase();
                         const snsTypeVal = (selectedDesignerDetail.snsType || '').toLowerCase();
                         const emailVal = (selectedDesignerDetail.email || '').toLowerCase();
                         
                         // 1. Check if Kakao login
                         const isKakao = providerVal === 'kakao' || 
                                         signedByVal === 'kakao' || 
                                         loginTypeVal === 'kakao' || 
                                         snsTypeVal === 'kakao' || 
                                         emailVal.includes('kakao.social') || 
                                         emailVal.includes('kakao_') || 
                                         emailVal.endsWith('@kakao.com');
                         
                         // 2. Check if Naver login
                         const isNaver = providerVal === 'naver' || 
                                         signedByVal === 'naver' || 
                                         loginTypeVal === 'naver' || 
                                         snsTypeVal === 'naver' || 
                                         emailVal.includes('naver.social') || 
                                         emailVal.includes('naver_') || 
                                         emailVal.endsWith('@naver.com');
                         
                         // 3. Check if Google login
                         const isGoogle = providerVal === 'google' || 
                                          signedByVal === 'google' || 
                                          loginTypeVal === 'google' || 
                                          snsTypeVal === 'google' || 
                                          emailVal.includes('google.social') || 
                                          emailVal.includes('google_') || 
                                          emailVal.includes('gmail');
                         
                         // 4. Check if Phone login
                         const isPhone = providerVal === 'phone' || 
                                         signedByVal === 'phone' || 
                                         loginTypeVal === 'phone' || 
                                         snsTypeVal === 'phone' || 
                                         emailVal.includes('social.user') || 
                                         emailVal.endsWith('.local') || 
                                         !emailVal || 
                                         !emailVal.includes('@');
                         
                         if (isGoogle) {
                           return (
                             <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-red-50 text-red-600 border border-red-100 shrink-0">
                               구글 (Google)
                             </span>
                           );
                         } else if (isKakao) {
                           return (
                             <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-yellow-50 text-yellow-800 border border-yellow-100 shrink-0">
                               카카오 (Kakao)
                             </span>
                           );
                         } else if (isNaver) {
                           return (
                             <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                               네이버 (Naver)
                             </span>
                           );
                         } else if (isPhone) {
                           return (
                             <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                               휴대폰번호
                             </span>
                           );
                         } else {
                           return (
                             <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
                               이메일 (Email)
                             </span>
                           );
                         }
                       })()}
                     </div>
                     <p className="text-xs text-gray-400 font-medium">{selectedDesignerDetail.email}</p>
                   </div>
                </div>
                <button
                  onClick={() => setSelectedDesignerDetail(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">기본 정보</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-500 font-bold mb-1">연락처</p>
                                <p className="text-sm text-gray-900 font-medium bg-gray-50 p-3 rounded-xl border border-gray-100">
                                  {selectedDesignerDetail.mobileNumber || selectedDesignerDetail.phone || '등록 안됨'}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div>
                                   <p className="text-xs text-gray-500 font-bold mb-1">직급</p>
                                   <p className="text-sm text-gray-900 font-medium bg-gray-50 p-3 rounded-xl border border-gray-100">
                                     {selectedDesignerDetail.role || selectedDesignerDetail.position || '미등록'}
                                   </p>
                               </div>
                               <div>
                                   <p className="text-xs text-gray-500 font-bold mb-1">경력</p>
                                   <p className="text-sm text-gray-900 font-medium bg-gray-50 p-3 rounded-xl border border-gray-100">
                                     {selectedDesignerDetail.career || selectedDesignerDetail.careerYears ? `${selectedDesignerDetail.career || selectedDesignerDetail.careerYears}년` : '미등록'}
                                   </p>
                               </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold mb-1">매장명</p>
                                <p className="text-sm text-gray-900 font-medium bg-gray-50 p-3 rounded-xl border border-gray-100">
                                  {selectedDesignerDetail.hairShop?.name || selectedDesignerDetail.hairShopName || '미등록'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold mb-1">매장 주소</p>
                                <p className="text-sm text-gray-900 font-medium bg-gray-50 p-3 rounded-xl border border-gray-100">
                                  {selectedDesignerDetail.hairShop?.roadAddress || selectedDesignerDetail.hairShop?.address || '미등록'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold mb-1">소개글</p>
                                <p className="text-sm text-gray-900 font-medium bg-gray-50 p-3 rounded-xl border border-gray-100 whitespace-pre-wrap min-h-[80px]">
                                  {selectedDesignerDetail.introduce || selectedDesignerDetail.introduction || '없음'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div>
                         <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">영업/휴무 정보</h3>
                         <div className="space-y-4 bg-white p-4 rounded-xl border border-gray-100 mb-8 max-h-[160px] overflow-y-auto">
                             <div>
                               <span className="text-xs text-gray-500 font-bold block mb-2">영업시간</span>
                               {selectedDesignerDetail.businessTimes && Array.isArray(selectedDesignerDetail.businessTimes) ? (
                                 <div className="space-y-1">
                                   {selectedDesignerDetail.businessTimes.map((bt: any, idx: number) => {
                                     const days = ['일', '월', '화', '수', '목', '금', '토'];
                                     if (!bt) return <div key={idx} className="text-sm text-gray-500">{days[idx]}: 휴무</div>;
                                     try {
                                       const start = new Date(bt.startedAt || bt.startTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Seoul' });
                                       const end = new Date(bt.endedAt || bt.endTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Seoul' });
                                       return <div key={idx} className="text-sm font-medium">{days[idx]}: {start} ~ {end}</div>;
                                     } catch(e) {
                                       return <div key={idx} className="text-sm font-medium">{days[idx]}: 형식 오류</div>;
                                     }
                                   })}
                                 </div>
                               ) : (
                                 <span className="text-sm font-medium">{selectedDesignerDetail.businessHours || selectedDesignerDetail.business_hours || '정보 없음'}</span>
                               )}
                             </div>
                             <div>
                               <span className="text-xs text-gray-500 font-bold">정기휴무: </span>
                               <span className="text-sm font-medium">
                                 {selectedDesignerDetail.holidays && selectedDesignerDetail.holidays.length > 0
                                   ? selectedDesignerDetail.holidays.map((h: any) => h.dayOfWeek || h).join(', ')
                                   : (selectedDesignerDetail.holiday || '휴무 없음')}
                               </span>
                             </div>
                         </div>
                         
                         <div className="flex items-center justify-between mb-4">
                           <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">총 보유 크레딧</h3>
                         </div>
                         <div className="bg-white p-4 rounded-xl border border-gray-100 mb-8 flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-500">잔여 크레딧</span>
                            <span className="text-lg font-bold text-indigo-600">
                               {selectedDesignerDetail.credit ?? selectedDesignerDetail.credits ?? 0} CR
                            </span>
                         </div>

                         <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">약관 동의</h3>
                         <div className="space-y-3">
                             <div className="text-xs text-gray-500 text-center py-4 bg-gray-50 rounded-xl border border-gray-100">
                               관리자 API에서 세부 약관 동의 내역을 제공하지 않습니다.
                             </div>
                         </div>
                    </div>
                 </div>
              </div>

              <div className="p-6 bg-white border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setSelectedDesignerDetail(null)}
                  className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Map Modal */}
      <AnimatePresence>
        {selectedMapLog && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 flex items-center justify-center rounded-xl">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900">추정 접속 위치</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {selectedMapLog.location} (위도: {selectedMapLog.latitude}, 경도: {selectedMapLog.longitude})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMapLog(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4 bg-gray-50 relative aspect-video flex-1">
                <iframe
                  title="Visitor Location"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  className="rounded-xl border border-gray-200"
                  src={`https://maps.google.com/maps?q=${selectedMapLog.latitude},${selectedMapLog.longitude}&hl=ko&z=15&output=embed`}
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-white">
                <div className="text-xs text-gray-500">
                  <span className="font-bold text-gray-700">IP:</span> {selectedMapLog.ip_address}
                </div>
                <button
                  onClick={() => setSelectedMapLog(null)}
                  className="px-6 py-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
