import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabase";
import { useSiteContext } from "../../context/SiteContext";
import { SiteSettings, RefinementHistoryItem, defaultSiteSettings } from "../../lib/siteSettings";
import {
  Save,
  AlertCircle,
  AlertTriangle,
  Layout,
  Image,
  Type,
  MousePointerClick,
  Settings,
  List,
  Smartphone,
  CreditCard,
  Plus,
  Trash2,
  X,
  GripVertical,
  Mail,
  Check,
  Wand2,
  Bold,
  Italic,
  Link,
  Youtube,
  LayoutTemplate,
  Image as ImageIcon,
  Loader,
  Loader2,
  CheckCircle2,
  Key,
  RefreshCw,
  Sparkles,
  Maximize,
  Minimize,
  History,
  RotateCcw,
  Clock,
  Eye,
  EyeOff,
  Users,
  Search,
  Globe,
  BarChart,
  Bot,
  Megaphone,
  Droplet
} from "lucide-react";
import * as Icons from "lucide-react";
import { motion } from "motion/react";
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
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RichTextEditor } from "./RichTextEditor";
import IconPickerModal from "./IconPickerModal";

// --- Sortable Components ---

interface SortableSidebarItemProps {
  key?: React.Key;
  id: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  hidden?: boolean;
  onClick: () => void;
  onToggleHide?: () => void;
}

const SortableSidebarItem = ({
  id,
  label,
  icon,
  active,
  hidden,
  onClick,
  onToggleHide,
}: SortableSidebarItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-1 ${isDragging ? "opacity-50" : ""}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-300 p-1 hover:text-gray-500 rounded"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="flex-1 flex items-center relative">
        <div className="flex-1" onClick={onClick}>
          <TabButton
            active={active}
            onClick={onClick}
            icon={icon}
            label={label}
          />
        </div>
        {onToggleHide && (
          <div
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={(e) => {
              e.stopPropagation();
              onToggleHide();
            }}
          >
            <div
              className={`w-8 h-4 rounded-full flex items-center p-0.5 cursor-pointer ${hidden ? "bg-gray-300" : "bg-brand-primary"} transition-colors`}
            >
              <div
                className={`w-3 h-3 bg-white rounded-full transition-transform ${hidden ? "translate-x-0" : "translate-x-4"}`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface SortablePartnerCardProps {
  key?: string | number;
  item: NonNullable<SiteSettings["partners"]>[0];
  idx: number;
  onUpdate: (index: number, key: string, value: any) => void;
  onDelete: (index: number) => void;
}

const SortablePartnerCard = ({
  item,
  idx,
  onUpdate,
  onDelete,
}: SortablePartnerCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

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
      className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${isDragging ? "shadow-xl ring-2 ring-brand-primary/50" : ""}`}
    >
      <div className="flex bg-gray-50 p-2 items-center border-b border-gray-100">
        <div
          {...attributes}
          {...listeners}
          className="p-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <GripVertical className="w-4 h-4" />
        </div>
        <div className="flex-1 text-sm font-bold text-gray-700 flex items-center justify-between px-2">
          <span>{item.name || "파트너사"}</span>
          <button
            onClick={() => onUpdate(idx, "hidden", !item.hidden)}
            className={`p-1.5 rounded-md transition-colors ${item.hidden ? "text-gray-400 bg-gray-200" : "text-brand-primary bg-brand-primary/10"}`}
            title={item.hidden ? "보이기" : "숨기기"}
          >
            {item.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <button
          onClick={() => onDelete(idx)}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            파트너사 이름
          </label>
          <input
            type="text"
            className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 text-sm"
            value={item.name || ""}
            onChange={(e) => onUpdate(idx, "name", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            로고 이미지 URL
          </label>
          <input
            type="text"
            placeholder="https://..."
            className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 text-sm"
            value={item.logoImage || ""}
            onChange={(e) => onUpdate(idx, "logoImage", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            연결 링크 (옵션)
          </label>
          <input
            type="text"
            placeholder="클릭 시 이동할 URL"
            className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 text-sm"
            value={item.linkUrl || ""}
            onChange={(e) => onUpdate(idx, "linkUrl", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

interface SortableBgImageItemProps {
  id: string; // The index as string
  url: string;
  idx: number;
  onUpdate: (index: number, url: string) => void;
  onDelete: (index: number) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  isUploading: boolean;
  onPreview?: (url: string) => void;
}

const SortableBgImageItem: React.FC<SortableBgImageItemProps> = ({
  id,
  url,
  idx,
  onUpdate,
  onDelete,
  onUpload,
  isUploading,
  onPreview
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

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
      className={`flex items-center gap-2 mb-2 p-2 bg-white border rounded-xl overflow-hidden ${isDragging ? "shadow-xl ring-2 ring-brand-primary/50 border-brand-primary" : "border-gray-200"}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="p-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 bg-gray-50 rounded"
      >
        <Icons.GripVertical className="w-4 h-4" />
      </div>
      
      {url ? (
        <div 
          className="w-10 h-10 rounded shrink-0 bg-gray-100 overflow-hidden border border-gray-200 relative group cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => onPreview?.(url)}
        >
          <img src={url} alt={`bg-${idx}`} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Icons.Eye className="w-4 h-4 text-white drop-shadow-md" />
          </div>
        </div>
      ) : (
        <div className="w-10 h-10 rounded shrink-0 bg-gray-100 flex items-center justify-center border border-gray-200">
          <Icons.Image className="w-4 h-4 text-gray-300" />
        </div>
      )}

      <input
        type="text"
        className="flex-1 border-0 bg-transparent p-2 outline-none text-sm"
        placeholder="https://..."
        value={url}
        onChange={(e) => onUpdate(idx, e.target.value)}
      />

      <label className={`cursor-pointer p-2 rounded-lg transition-colors ${isUploading ? 'text-gray-300 pointer-events-none' : 'text-brand-primary hover:bg-brand-primary/10'}`} title="이미지 교체">
        {isUploading ? <Loader className="w-4 h-4 animate-spin" /> : <Icons.Upload className="w-4 h-4" />}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => onUpload(e, idx)} disabled={isUploading} />
      </label>

      <button
        type="button"
        className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
        onClick={() => onDelete(idx)}
        title="삭제"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

interface SortableFeatureCardProps {
  key?: string | number;
  item: SiteSettings["features"]["items"][0];
  idx: number;
  onUpdate: (index: number, key: any, value: any) => void;
  onDelete: (index: number) => void;
}

const SortableFeatureCard = ({
  item,
  idx,
  onUpdate,
  onDelete,
}: SortableFeatureCardProps) => {
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  const currentIconType = item.iconType || 'lucide';
  
  // Dynamic icon component for rendering preview
  const IconComponent = currentIconType === 'lucide' ? (Icons as any)[item.icon] || CheckCircle2 : null;

  return (
    <>
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 rounded-xl border transition-all ${
        item.hidden ? "bg-gray-50 opacity-60" : "bg-white shadow-sm"
      } ${isDragging ? "shadow-2xl ring-2 ring-brand-primary/20" : ""}`}
    >
      <div className="flex items-start gap-4">
        <div
          {...attributes}
          {...listeners}
          className="mt-1.5 cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded text-gray-400"
        >
          <GripVertical className="w-4 h-4" />
        </div>
        <input
          type="checkbox"
          className="mt-1.5 w-5 h-5 rounded text-brand-primary"
          checked={!item.hidden}
          onChange={(e) => onUpdate(idx, "hidden", !e.target.checked)}
        />
        <div className="flex-1 space-y-3">
          <div className="flex items-start gap-4">
            <div className="shrink-0 flex flex-col items-center cursor-pointer" onClick={() => setIsIconModalOpen(true)}>
              <label className="block text-xs font-bold text-gray-400 mb-1 text-center cursor-pointer">
                아이콘
              </label>
              <button
                className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-200 hover:border-brand-primary hover:text-brand-primary hover:shadow-md transition-all group"
                title="아이콘 변경"
              >
                {currentIconType === 'emoji' ? (
                  <span className="text-2xl leading-none group-hover:scale-110 transition-transform">{item.icon}</span>
                ) : currentIconType === 'image' ? (
                  <img src={item.icon} alt="" className="max-w-[1.5rem] max-h-[1.5rem] object-contain group-hover:scale-110 transition-transform" onError={(e) => (e.target as any).style.display = 'none'} onLoad={(e) => (e.target as any).style.display = 'block'} />
                ) : IconComponent ? (
                  <IconComponent className="w-6 h-6 text-gray-600 group-hover:text-brand-primary transition-colors" />
                ) : null}
              </button>
            </div>
            
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 mb-1">
                제목
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="w-full border rounded-lg p-2 text-sm font-bold outline-none focus:ring-2"
                  placeholder="기능명"
                  value={item.title}
                  onChange={(e) => onUpdate(idx, "title", e.target.value)}
                />
                <button
                  onClick={() => onDelete(idx)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 shrink-0"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              설명
            </label>
            <textarea
              className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 h-16"
              placeholder="설명"
              value={item.description}
              onChange={(e) => onUpdate(idx, "description", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
    
    <IconPickerModal 
      isOpen={isIconModalOpen}
      onClose={() => setIsIconModalOpen(false)}
      onSelect={(type, value) => {
         onUpdate(idx, 'iconType', type);
         onUpdate(idx, 'icon', value);
      }}
      initialType={item.iconType as 'lucide' | 'emoji' | 'image' | undefined}
      initialValue={item.icon}
    />
    </>
  );
};

interface SortableDetailItemProps {
  key?: string | number;
  planIndex: number;
  featureIndex: number;
  feature: { id: string; text: string };
  onUpdate: (pIdx: number, fIdx: number, text: string) => void;
  onDelete: (pIdx: number, fIdx: number) => void;
}

const SortableDetailItem = ({
  planIndex,
  featureIndex,
  feature,
  onUpdate,
  onDelete,
}: SortableDetailItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: feature.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex gap-2 group items-center ${isDragging ? "z-50 opacity-50" : ""}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500"
      >
        <GripVertical className="w-3 h-3" />
      </div>
      <input
        type="text"
        className="flex-1 border rounded-lg p-2 text-xs outline-none focus:ring-2 group-hover:border-gray-300 transition-colors"
        value={feature.text}
        onChange={(e) => onUpdate(planIndex, featureIndex, e.target.value)}
      />
      <button
        onClick={() => onDelete(planIndex, featureIndex)}
        className="p-1 px-2 text-gray-300 hover:text-red-500 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

interface SortableNavLinkProps {
  key?: React.Key;
  link: { id: string; label: string; href: string; hidden?: boolean };
  index: number;
  onUpdate: (index: number, key: string, value: any) => void;
  onDelete: (index: number) => void;
}

const SortableNavLink = ({
  link,
  index,
  onUpdate,
  onDelete,
}: SortableNavLinkProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex gap-2 bg-white p-2 rounded-lg border items-center ${isDragging ? "z-50 opacity-50 relative" : ""}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 pl-1 p-1"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      <button
        onClick={() => onUpdate(index, "hidden", !link.hidden)}
        className={`p-1.5 rounded-md transition-colors ${link.hidden ? 'text-gray-400 bg-gray-100' : 'text-brand-primary bg-brand-primary/10'}`}
        title={link.hidden ? "메뉴 숨김 해제" : "메뉴 숨기기"}
      >
        {link.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
      <input
        type="text"
        className="w-32 border rounded p-2 text-sm outline-none focus:ring-2"
        placeholder="메뉴 이름"
        value={link.label}
        onChange={(e) => onUpdate(index, "label", e.target.value)}
      />
      <input
        type="text"
        className="flex-1 border rounded p-2 text-sm outline-none focus:ring-2"
        placeholder="링크 (#섹션 또는 URL)"
        value={link.href}
        onChange={(e) => onUpdate(index, "href", e.target.value)}
      />
      <button
        onClick={() => onDelete(index)}
        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

interface SortableApiKeyProps {
  key?: React.Key;
  apiKeyObj: any;
  onUpdate: (id: string, key: string, value: any) => void;
  onRemove: (id: string) => void;
}

const SortableApiKey = ({
  apiKeyObj,
  onUpdate,
  onRemove,
}: SortableApiKeyProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: apiKeyObj.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const DAILY_QUOTA = (apiKeyObj.model?.includes("pro") || apiKeyObj.model?.includes("3.")) ? 50 : 1500;
  const RPM_LIMIT = (apiKeyObj.model?.includes("pro") || apiKeyObj.model?.includes("3.")) ? 2 : 15;
  const remainingTokens = Math.max(
    0,
    DAILY_QUOTA - (apiKeyObj.usageCount || 0),
  );
  const usagePercent = Math.min(
    100,
    ((apiKeyObj.usageCount || 0) / DAILY_QUOTA) * 100,
  );
  const isActive = apiKeyObj.isActive !== false;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex gap-3 items-start p-4 rounded-xl border-2 transition-all ${isDragging ? "z-50 opacity-50 relative" : ""} ${!isActive ? "bg-gray-50 border-gray-200" : apiKeyObj.isExhausted ? "bg-red-50/50 border-red-100 shadow-sm" : "bg-white border-gray-100 shadow-sm hover:border-brand-primary/30"}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 pt-2"
      >
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="flex-1 w-full space-y-3">
        <div className="flex items-center gap-3">
          <input
            type="text"
            className={`font-bold text-gray-900 border-none p-0 focus:ring-0 bg-transparent outline-none w-1/3 ${!isActive && "opacity-60"}`}
            value={apiKeyObj.label}
            onChange={(e) => onUpdate(apiKeyObj.id, "label", e.target.value)}
            placeholder="API Key 이름"
          />
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onUpdate(apiKeyObj.id, "isActive", !isActive)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${isActive ? "bg-indigo-100 text-indigo-600" : "bg-gray-200 text-gray-500"}`}
            >
              {isActive ? "Enabled" : "Disabled"}
            </button>
            {isActive && apiKeyObj.isExhausted ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-wider">
                <AlertCircle className="w-3 h-3" /> Exhausted
              </span>
            ) : isActive ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            ) : null}
            <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              Remaining: {remainingTokens.toLocaleString()} /{" "}
              {DAILY_QUOTA.toLocaleString()} (Limit: {RPM_LIMIT} RPM)
            </span>
          </div>
        </div>
        {isActive && (
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-1 mb-2">
            <div
              className={`h-full ${usagePercent > 90 ? "bg-red-500" : usagePercent > 70 ? "bg-orange-500" : "bg-blue-500"}`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        )}
        <div
          className={`flex flex-col sm:flex-row gap-3 ${!isActive && "opacity-50 pointer-events-none"}`}
        >
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type="password"
                className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 pr-10 text-sm bg-white"
                placeholder="AIza..."
                value={apiKeyObj.key}
                onChange={(e) => onUpdate(apiKeyObj.id, "key", e.target.value)}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300">
                <Key className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="w-full sm:w-48">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">
              Model
            </label>
            <select
              className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 text-sm bg-white"
              value={apiKeyObj.model || "gemini-3-flash-preview"}
              onChange={(e) => onUpdate(apiKeyObj.id, "model", e.target.value)}
            >
              <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (최신/강력)</option>
              <option value="gemini-3-flash-preview">Gemini 3 Flash (최신/고속)</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
            </select>
          </div>
        </div>
        {apiKeyObj.isExhausted && apiKeyObj.lastExhaustedAt && (
          <p className="text-[11px] text-red-500 mt-2 font-medium">
            * 최근 소진: {new Date(apiKeyObj.lastExhaustedAt).toLocaleString()}{" "}
            (할당량 초과)
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2 ml-2">
        <button
          onClick={() => onRemove(apiKeyObj.id)}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          title="삭제"
        >
          <Trash2 className="w-5 h-5" />
        </button>
        <button
          onClick={() => onUpdate(apiKeyObj.id, "isExhausted", false)}
          className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
          title="상태 초기화"
        >
          <RefreshCw
            className={`w-5 h-5 ${apiKeyObj.isExhausted ? "animate-pulse text-emerald-500" : ""}`}
          />
        </button>
      </div>
    </div>
  );
};

// --- Main Editor Component ---
export default function SiteEditor() {
  const { settings, updateSettings, error, isLoading } = useSiteContext();
  const [draft, setDraft] = useState<SiteSettings>(
    JSON.parse(JSON.stringify(settings)),
  );
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("hero");
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isPromoPreviewOpen, setIsPromoPreviewOpen] = useState(false);
  const [samplePromoContent, setSamplePromoContent] = useState("");
  const [isGeneratingPromo, setIsGeneratingPromo] = useState(false);
  const [promoHistoryFilter, setPromoHistoryFilter] = useState({ start: '', end: '' });
  const [isUploadingBgImage, setIsUploadingBgImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [termsPrompt, setTermsPrompt] = useState("");
  const [privacyPrompt, setPrivacyPrompt] = useState("");
  const [isGeneratingTerms, setIsGeneratingTerms] = useState(false);
  const [isGeneratingPrivacy, setIsGeneratingPrivacy] = useState(false);

  const [isUploadingEventBanner, setIsUploadingEventBanner] = useState<Record<string, boolean>>({});
  const [isUploadingPopupImage, setIsUploadingPopupImage] = useState<Record<string, boolean>>({});

  const handlePopupImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const popupId = draft.popups![idx].id;
    setIsUploadingPopupImage(prev => ({ ...prev, [popupId]: true }));
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `popups/img_${Math.random().toString(36).substring(2, 10)}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('models')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('models').getPublicUrl(fileName);

      const oldUrl = draft.popups![idx].imageUrl;
      if (oldUrl?.includes('supabase.co/storage/v1/object/public/models/popups/')) {
        const oldFilePath = oldUrl.split('models/')[1];
        if (oldFilePath) {
          try {
            await supabase.storage.from('models').remove([oldFilePath]);
          } catch (err) {
            console.error('Failed to delete old popup image', err);
          }
        }
      }

      const newPopups = [...draft.popups!];
      newPopups[idx] = { ...newPopups[idx], imageUrl: urlData.publicUrl };
      setDraft({ ...draft, popups: newPopups });
    } catch (error) {
      console.error(error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploadingPopupImage(prev => ({ ...prev, [popupId]: false }));
    }
  };

  const handleEventBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const postId = draft.eventPosts![idx].id;
    setIsUploadingEventBanner(prev => ({ ...prev, [postId]: true }));
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `events/banner_${Math.random().toString(36).substring(2, 10)}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('models')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('models').getPublicUrl(fileName);

      // delete old if existing
      const oldUrl = draft.eventPosts![idx].imageUrl;
      if (oldUrl?.includes('supabase.co/storage/v1/object/public/models/events/')) {
        const oldFilePath = oldUrl.split('models/')[1];
        if (oldFilePath) {
          await supabase.storage.from('models').remove([oldFilePath]);
        }
      }

      const newPosts = [...draft.eventPosts!];
      newPosts[idx] = { ...newPosts[idx], imageUrl: urlData.publicUrl };
      setDraft({ ...draft, eventPosts: newPosts });
    } catch (error) {
      console.error(error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploadingEventBanner(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleBgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBgImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `hero_${Date.now()}.${fileExt}`;
      const filePath = `site_assets/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('models')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('models').getPublicUrl(filePath);
      
      const currentImages = draft.hero.bgImages && draft.hero.bgImages.length > 0
        ? draft.hero.bgImages 
        : (draft.hero.bgImage ? [draft.hero.bgImage] : []);
        
      let newImages = [...currentImages];
      
      if (typeof targetIndex === 'number' && targetIndex >= 0 && targetIndex < newImages.length) {
         if (typeof newImages[targetIndex] === 'string') {
           newImages[targetIndex] = { id: `img-${Date.now()}-${targetIndex}`, url: urlData.publicUrl };
         } else {
           newImages[targetIndex] = { ...newImages[targetIndex], url: urlData.publicUrl };
         }
      } else {
         newImages = [...newImages, { id: `img-${Date.now()}-new`, url: urlData.publicUrl }];
      }
      
      const firstImg = newImages[0];
      const newBgImage = firstImg ? (typeof firstImg === 'string' ? firstImg : firstImg.url) : '';
      
      setDraft(prev => ({
        ...prev,
        hero: {
          ...prev.hero,
          bgImages: newImages,
          bgImage: newBgImage // fallback to first image
        }
      }));
    } catch (error: any) {
      console.error('Upload error:', error);
      alert('이미지 업로드에 실패했습니다: ' + error.message);
    } finally {
      setIsUploadingBgImage(false);
      // Reset input
      e.target.value = '';
    }
  };

  const generateTextWithAI = async (prompt: string): Promise<string> => {
    let availableKeys = [...(settings.integrations?.geminiApiKeys || [])]
      .filter((k) => k.key && !k.isExhausted && k.isActive !== false);

    if (availableKeys.length === 0 && settings.integrations?.geminiApiKey) {
      availableKeys = [{
        id: "legacy",
        key: settings.integrations.geminiApiKey,
        model: "gemini-3-flash-preview",
        label: "기본 API 키",
        isExhausted: false,
        usageCount: 0,
      } as any];
    }

    if (availableKeys.length === 0) {
      throw new Error("사용 가능한 활성화된 Gemini API 키가 없습니다.");
    }

    for (const apiKeyObj of availableKeys) {
      try {
        const activeModel = apiKeyObj.model || "gemini-3-flash-preview";
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKeyObj.key}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          },
        ).catch((err: any) => {
          if (err.message === 'Failed to fetch') {
            throw new Error('네트워크 연결 오류: 구글 AI 서버에 접근할 수 없습니다. 광고 차단기(AdBlock)를 확인해주세요.');
          }
          throw err;
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "API 요청 실패");

        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generatedText) return generatedText.trim();
      } catch (err: any) {
        console.error("API error:", err);
      }
    }
    throw new Error("AI 생성 실패");
  };

  const handleGenerateTerms = async () => {
    if (!termsPrompt) return alert("프롬프트를 입력해주세요.");
    setIsGeneratingTerms(true);
    try {
      const fullPrompt = `${termsPrompt}\n\n이 서비스의 서비스 이용약관을 상세하게 작성해줘. 제목이나 마크다운 형식 등 불필요한 꾸밈없이 평문 텍스트로만 줘.`;
      const text = await generateTextWithAI(fullPrompt);
      setDraft((prev) => ({
        ...prev,
        footer: {
          ...prev.footer,
          policies: { ...prev.footer.policies, terms: text },
        },
      }));
    } catch (err: any) {
      alert(err.message);
    }
    setIsGeneratingTerms(false);
  };

  const handleGeneratePrivacy = async () => {
    if (!privacyPrompt) return alert("프롬프트를 입력해주세요.");
    setIsGeneratingPrivacy(true);
    try {
      const fullPrompt = `${privacyPrompt}\n\n이 서비스의 개인정보처리방침을 상세하게 작성해줘. 제목이나 마크다운 형식 등 불필요한 꾸밈없이 평문 텍스트로만 줘.`;
      const text = await generateTextWithAI(fullPrompt);
      setDraft((prev) => ({
        ...prev,
        footer: {
          ...prev.footer,
          policies: { ...prev.footer.policies, privacy: text },
        },
      }));
    } catch (err: any) {
      alert(err.message);
    }
    setIsGeneratingPrivacy(false);
  };

  const generateSamplePromo = async () => {
    setIsGeneratingPromo(true);
    
    try {
      const mainContent = draft.promoSettings?.mainPromoContent || '스마트 예약부터 고도화된 CRM까지 완벽한 헤어디자이너 필수 플랫폼 헤어딜';
      const toneMap: Record<string, string> = {
        professional: '전문적인/신뢰감 있는',
        friendly: '친근한/소통하는',
        trendy: '트렌디한/감각적인',
        informative: '정보 제공형/교육적인',
      };
      
      const currentToneStr = draft.promoSettings?.tone && toneMap[draft.promoSettings.tone] ? toneMap[draft.promoSettings.tone] : '전문적인';
      const platformsArr = draft.promoSettings?.platforms || ['instagram', 'naver_cafe'];
      
      const response = await fetch('/api/generate-promo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mainContent,
          tone: currentToneStr,
          platforms: platformsArr
        })
      });

      if (!response.ok) {
        throw new Error('프로모션 생성에 실패했습니다.');
      }

      const aiResult = await response.json();
      
      let sampleResult = `[홍보 내용 요약]\n주제: ${mainContent}\n어조: ${currentToneStr}\n---\n\n`;
      const platformContents: Record<string, string> = {};

      if (aiResult.instagram) {
        sampleResult += `[Instagram (인스타그램)]\n${aiResult.instagram}\n\n`;
        platformContents['instagram'] = aiResult.instagram;
      }
      if (aiResult.naver) {
        sampleResult += `[Naver (네이버 블로그/카페)]\n${aiResult.naver}\n\n`;
        platformContents['naver_cafe'] = aiResult.naver;
        platformContents['naver_blog'] = aiResult.naver;
      }
      if (aiResult.kakao) {
        sampleResult += `[KakaoTalk (오픈채팅)]\n${aiResult.kakao}\n\n`;
        platformContents['kakaotalk'] = aiResult.kakao;
      }

      const finalContent = sampleResult.trim();
      setSamplePromoContent(finalContent);
      setIsGeneratingPromo(false);
      setIsPromoPreviewOpen(true);
      
      const newHistory = {
        id: Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString(),
        content: finalContent,
        mainPromoContent: mainContent,
        platformContents,
        status: platformsArr.reduce((acc, p) => {
          const providerMap: Record<string, 'instagram' | 'naver' | 'kakao'> = {
            'instagram': 'instagram',
            'naver_cafe': 'naver',
            'naver_blog': 'naver',
            'kakaotalk': 'kakao'
          };
          const providerKey = providerMap[p];
          const isConnected = draft.promoSettings?.credentials?.[providerKey]?.connected;
          return { ...acc, [p]: isConnected ? 'success' : 'failed' };
        }, {}) as Record<string, 'success' | 'failed' | 'pending'>
      };
      
      const newDraft = {
        ...draft,
        promoSettings: {
          enabled: false,
          platforms: [],
          frequency: 'weekly',
          tone: 'professional',
          ...draft.promoSettings,
          lastPostedAt: new Date().toISOString(),
          history: [newHistory, ...(draft.promoSettings?.history || [])]
        }
      };
      
      setDraft(newDraft);
      
      // Auto-save history to DB so it persists on refresh
      await updateSettings(newDraft).catch(err => {
        console.error('Failed to auto-save promo history to DB:', err);
      });
    } catch (err) {
      console.error(err);
      alert('홍보글 생성 중 오류가 발생했습니다.');
      setIsGeneratingPromo(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFullScreenLayerId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { provider, username } = event.data;
        updatePromoSettings("credentials", {
          ...draft.promoSettings?.credentials,
          [provider]: { connected: true, username }
        });
        alert(`${provider} 계정이 연동되었습니다.`);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [draft.promoSettings?.credentials]);

  const handleOAuthConnect = async (provider: 'instagram' | 'naver' | 'kakao') => {
    // Open popup immediately to avoid browser popup blockers
    const authWindow = window.open('', 'oauth_popup', 'width=600,height=700');
    
    try {
      if (authWindow) {
        authWindow.location.href = `${window.location.origin}/?oauth_callback=${provider}`;
      } else {
        alert('팝업 차단이 감지되었습니다. 팝업을 허용해주세요.');
      }
    } catch (err) {
      console.error(err);
      if (authWindow) authWindow.close();
      alert('인증 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarVisible &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(event.target as Node)
      ) {
        // Close the sidebar when clicking outside
        setSidebarVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarVisible]);

  const htmlEditorRef = useRef<HTMLTextAreaElement>(null);
  const [htmlPreviewMode, setHtmlPreviewMode] = useState<
    Record<string, boolean>
  >({});
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [refinementTriggers, setRefinementTriggers] = useState<Record<string, number>>({});
  const [fullScreenLayerId, setFullScreenLayerId] = useState<string | null>(null);
  const [historyModalOpenId, setHistoryModalOpenId] = useState<string | null>(null);

  const handleGenerateAiContent = async (
    layerId: string,
    editorPrompt: string,
  ): Promise<string | void> => {
    const layer = draft.layers?.find((l) => l.id === layerId);
    let prompt = editorPrompt;

    if (!prompt && layer?.subtitle) {
      prompt = layer.subtitle;
    }
    if (!prompt) return;

    const sysPrompt = `당신은 극강의 실력을 갖춘 전문 UI/UX 웹 디자이너이자 카피라이터입니다.
주어진 프롬프트(주제)를 바탕으로, 현재 웹사이트의 디자인 시스템과 톤앤매너에 완벽하게 어울리는 세련된 HTML 마크업을 작성해 주세요. 

[디자인 시스템 및 핵심 규칙]
1. 스타일링: Tailwind CSS 유틸리티 클래스만 사용하세요.
2. 컬러 팔레트:
   - 포인트 컬러: text-brand-primary, bg-brand-primary, bg-brand-primary/10 (연한 배경용)
   - 텍스트: 제목은 text-gray-900, 중요 본문은 text-gray-700, 일반 본문은 text-gray-500
   - 배경: bg-white, bg-gray-50
3. 레이아웃 및 형태:
   - 절대 상위 컨테이너(bg-gray-50, py-16, max-w-4xl 등)를 생성하지 마세요. 이미 컨테이너 안에 렌더링되므로, 내부 콘텐츠 요소만 반환하세요.
   - 모서리 둥글기: rounded-xl, rounded-2xl
   - 여백: p-4, p-6, grid, flex, gap-6 등 적절한 여백
   - 테두리: border border-gray-100, shadow-sm, hover:shadow-md 등 입체감 추가
4. 마케팅 카피:
   - 프롬프트 주제에 맞춰 임팩트 있는 헤드라인, 설득력 있는 서브 문구, 필요시 리스트(장점 3가지 등)를 자동으로 생성하여 포함하세요.
5. 이미지 삽입:
   - 내용에 어울리는 고품질 이미지를 반드시 포함하세요. 
   - <img src="https://images.unsplash.com/random/800x600/?주제관련영문단어1,주제관련영문단어2" alt="설명" className="w-full h-64 md:h-80 object-cover rounded-xl shadow-sm mb-6" /> 와 같은 형식을 사용하여 동적 이미지가 로드되게 하세요.

출력은 반드시 <div>로 시작하는 순수한 HTML 코드만 반환해야 하며, 마크다운(\`\`\`html)이나 추가적인 설명을 절대 포함하지 마세요.`;

    return runAiGeneration(`${sysPrompt}\n\n프롬프트: ${prompt}`, layerId);
  };

  const handleRefineAiContent = async (
    layerId: string,
    currentHtml: string,
    refinePrompt: string,
  ) => {
    if (!refinePrompt) {
      alert("수정 요청 사항을 입력해주세요.");
      return;
    }

    const refinementSysPrompt = `당신은 웹 디자인 전문가입니다. 
주어진 기존 HTML 코드를 사용자의 요청사항에 맞춰 수정해주세요.

[규칙]
1. 스타일링: Tailwind CSS 클래스만 사용하세요.
2. 톤앤매너: 기존 디자인 시스템(컬러, 둥글기 등)을 최대한 유지하면서 요청사항을 반영하세요.
3. 출력: 반드시 <div>로 시작하는 순수한 HTML 코드만 반환해야 하며, 마크다운(\`\`\`html)이나 추가 설명을 절대 포함하지 마세요.
4. 상위 컨테이너 금지: 내부 콘텐츠 요소만 반환하세요.

[기존 코드]
${currentHtml}`;

    const refinedHtml = await runAiGeneration(refinementSysPrompt + `\n\n수정 요청: ${refinePrompt}`, layerId);
    
    if (refinedHtml) {
      const historyItem: RefinementHistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        prompt: refinePrompt,
        beforeContent: currentHtml,
        afterContent: refinedHtml
      };

      setDraft((prev) => ({
        ...prev,
        layers: prev.layers?.map((l) =>
          l.id === layerId ? { 
            ...l, 
            contentHtml: refinedHtml,
            refinementHistory: [...(l.refinementHistory || []), historyItem]
          } : l
        ),
      }));
      
      // Trigger preview mode and show success
      setRefinementTriggers(prev => ({
        ...prev,
        [layerId]: (prev[layerId] || 0) + 1
      }));
      
      setSuccessMsg("AI 수정이 완료되었습니다! 미리보기 화면에서 확인해보세요.");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const handleRollback = (layerId: string, historyItemId: string) => {
    setDraft((prev) => {
      const layer = prev.layers?.find((l) => l.id === layerId);
      if (!layer || !layer.refinementHistory) return prev;

      const historyItem = layer.refinementHistory.find((h) => h.id === historyItemId);
      if (!historyItem) return prev;

      return {
        ...prev,
        layers: prev.layers?.map((l) =>
          l.id === layerId ? { ...l, contentHtml: historyItem.afterContent } : l
        ),
      };
    });
    
    setSuccessMsg("이전 버전으로 롤백되었습니다.");
    setTimeout(() => setSuccessMsg(""), 3000);
    setHistoryModalOpenId(null);
  };

  const runAiGeneration = async (fullPrompt: string, layerId: string): Promise<string | void> => {
    let availableKeys = [...(settings.integrations?.geminiApiKeys || [])]
      .map((k) => {
        if (
          k.isExhausted &&
          k.lastExhaustedAt &&
          Date.now() - new Date(k.lastExhaustedAt).getTime() > 60000
        ) {
          k.isExhausted = false;
        }
        return k;
      })
      .filter((k) => k.key && !k.isExhausted && k.isActive !== false)
      .sort((a, b) => (a.usageCount || 0) - (b.usageCount || 0));

    if (availableKeys.length === 0 && settings.integrations?.geminiApiKey) {
      availableKeys = [
        {
          id: "legacy",
          key: settings.integrations.geminiApiKey,
          model: "gemini-3-flash-preview",
          label: "기본 API 키",
          isExhausted: false,
          usageCount: 0,
        },
      ];
    }

    if (availableKeys.length === 0) {
      alert(
        "사용 가능한 활성화된 Gemini API 키가 없습니다. API 연동 설정 탭에서 API Key를 등록하거나 토큰 할당량을 확인해주세요.",
      );
      return;
    }

    setIsGeneratingAi(true);

    let lastError = "";

    try {
      for (const apiKeyObj of availableKeys) {
        try {
          const activeModel = apiKeyObj.model || "gemini-3-flash-preview";

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKeyObj.key}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  { parts: [{ text: fullPrompt }] },
                ],
              }),
            },
          ).catch((err: any) => {
            if (err.message === 'Failed to fetch') {
              throw new Error('네트워크 연결 오류: 구글 AI 서버에 접근할 수 없습니다. 광고 차단기(AdBlock)를 확인해주세요.');
            }
            throw err;
          });

          const data = await response.json();

          if (
            response.status === 429 ||
            response.status === 503 ||
            (data.error &&
              (data.error.code === 429 ||
                data.error.message?.includes("quota") ||
                data.error.message?.includes("demand")))
          ) {
            console.warn(
              `API Key ${apiKeyObj.label} exhausted. Trying next key...`,
            );
            if (apiKeyObj.id !== "legacy") {
              const updatedKeys = (settings.integrations?.geminiApiKeys || []).map(k => 
                k.id === apiKeyObj.id ? { ...k, isExhausted: true, lastExhaustedAt: new Date().toISOString() } : k
              );
              await updateSettings({ ...settings, integrations: { ...settings.integrations, geminiApiKeys: updatedKeys } });
            }
            continue;
          }

          if (!response.ok) {
            throw new Error(data.error?.message || "API 요청에 실패했습니다.");
          }

          const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

          if (generatedText) {
            if (apiKeyObj.id !== "legacy") {
              const updatedKeys = (settings.integrations?.geminiApiKeys || []).map(k => 
                k.id === apiKeyObj.id ? { ...k, usageCount: (k.usageCount || 0) + 1 } : k
              );
              await updateSettings({ ...settings, integrations: { ...settings.integrations, geminiApiKeys: updatedKeys } });
            }

            const cleanedHtml = generatedText
              .replace(/```html/g, "")
              .replace(/```/g, "")
              .trim();
              
            setDraft((prev) => ({
              ...prev,
              layers: prev.layers?.map((l) =>
                l.id === layerId ? { ...l, useGlassCard: false } : l,
              ),
            }));
            
            return cleanedHtml;
          } else {
            if (data.error) throw new Error(data.error.message);
            throw new Error("생성된 텍스트가 없습니다.");
          }
        } catch (err: any) {
          console.error(`Error with API Key ${apiKeyObj.label}:`, err);
          lastError = err.message || String(err);
          continue;
        }
      }

      alert(
        `콘텐츠 생성 중 오류가 발생했습니다: ${lastError}\n모든 API 키를 시도했으나 실패했습니다.`,
      );
    } finally {
      setIsGeneratingAi(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !initialLoaded) {
      const parsed = JSON.parse(JSON.stringify(settings));
      if (!parsed.layers) parsed.layers = [];
      if (!parsed.sectionOrder) {
        parsed.sectionOrder = ["features", "aiDemo", "pricing", "partners"];
      } else if (!parsed.sectionOrder.includes("partners")) {
        // Fallback for existing data that might be missing 'partners'
        parsed.sectionOrder.splice(parsed.sectionOrder.length, 0, "partners");
      }
      
      // Normalize bgImages to proper objects with IDs
      if (!parsed.hero) parsed.hero = {};
      if (!parsed.hero.bgImages || parsed.hero.bgImages.length === 0) {
        if (parsed.hero.bgImage) {
          parsed.hero.bgImages = [{ id: `img-${Date.now()}-0`, url: parsed.hero.bgImage }];
        } else {
          parsed.hero.bgImages = [];
        }
      } else {
        parsed.hero.bgImages = parsed.hero.bgImages.map((img: any, i: number) => 
          typeof img === 'string' ? { id: `img-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`, url: img } : img
        );
      }
      
      setDraft(parsed);
      setInitialLoaded(true);
    }
  }, [isLoading, settings, initialLoaded]);

  const getSectionIdFromHref = (href: string) => {
    // match '#...anything...'
    const match = href.match(/#([a-zA-Z0-9_\-]+)$/);
    if (match) {
      const idOrAnchor = match[1];
      if (idOrAnchor === "marketing") return "aiDemo"; // Handle default alias

      // Find if it maps to any known section
      if (draft.sectionOrder?.includes(idOrAnchor)) return idOrAnchor;

      const layer = draft.layers?.find(
        (l) => l.anchorId === idOrAnchor || l.id === idOrAnchor,
      );
      if (layer) return layer.id;
    }
    return null;
  };

  const handleApiKeyDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex =
        draft.integrations?.geminiApiKeys?.findIndex(
          (k) => k.id === active.id,
        ) ?? -1;
      const newIndex =
        draft.integrations?.geminiApiKeys?.findIndex((k) => k.id === over.id) ??
        -1;

      if (oldIndex !== -1 && newIndex !== -1) {
        setDraft({
          ...draft,
          integrations: {
            ...draft.integrations,
            facefusionUrl: draft.integrations?.facefusionUrl || "",
            geminiApiKeys: arrayMove(
              draft.integrations?.geminiApiKeys || [],
              oldIndex,
              newIndex,
            ),
          },
        });
      }
    }
  };

  const handleSidebarDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = draft.sectionOrder!.indexOf(active.id as string);
      const newIndex = draft.sectionOrder!.indexOf(over.id as string);
      const newSectionOrder = arrayMove(
        draft.sectionOrder!,
        oldIndex,
        newIndex,
      );

      const newNavLinks = [...draft.nav.links];
      newNavLinks.sort((a, b) => {
        const sIdA = getSectionIdFromHref(a.href);
        const sIdB = getSectionIdFromHref(b.href);
        const idxA = sIdA ? newSectionOrder.indexOf(sIdA) : 9999;
        const idxB = sIdB ? newSectionOrder.indexOf(sIdB) : 9999;
        if (idxA === idxB) return 0;
        return idxA - idxB;
      });

      setDraft({
        ...draft,
        sectionOrder: newSectionOrder,
        nav: { ...draft.nav, links: newNavLinks },
      });
    }
  };

  const handleNavLinkDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = draft.nav.links.findIndex((l) => l.id === active.id);
      const newIndex = draft.nav.links.findIndex((l) => l.id === over.id);
      const newNavLinks = arrayMove(draft.nav.links, oldIndex, newIndex) as {
        id: string;
        label: string;
        href: string;
      }[];

      const newSectionOrder = [...(draft.sectionOrder || [])];
      newSectionOrder.sort((sIdA, sIdB) => {
        const idxA = newNavLinks.findIndex(
          (l) => getSectionIdFromHref(l.href) === sIdA,
        );
        const idxB = newNavLinks.findIndex(
          (l) => getSectionIdFromHref(l.href) === sIdB,
        );

        const posA = idxA !== -1 ? idxA : 9999;
        const posB = idxB !== -1 ? idxB : 9999;
        if (posA === posB) return 0;
        return posA - posB;
      });

      setDraft({
        ...draft,
        nav: { ...draft.nav, links: newNavLinks },
        sectionOrder: newSectionOrder,
      });
    }
  };

  const handleAddLayer = () => {
    const layerCount = (draft.layers?.length || 0) + 1;
    const newLayerId = "layer_" + Date.now();
    const newLayerCountStr = layerCount.toString().padStart(2, "0");

    const newLayer: NonNullable<SiteSettings["layers"]>[0] = {
      id: newLayerId,
      name: `${newLayerCountStr} 레이어`,
      hidden: false,
      anchorId: "",
      title: "새로운 레이어 타이틀",
      subtitle: "서브 타이틀을 입력하세요.",
      contentHtml: "",
      useGlassCard: true,
      useWhiteBg: false,
      primaryBtn: "",
      primaryBtnLink: "#",
      primaryBtnColor: "bg-brand-primary text-white",
      secondaryBtn: "",
      secondaryBtnLink: "#",
      secondaryBtnColor: "bg-white text-gray-900 border border-gray-200",
    };

    setDraft({
      ...draft,
      layers: [...(draft.layers || []), newLayer],
      sectionOrder: [...(draft.sectionOrder || []), newLayerId],
    });
    setActiveTab(newLayerId);
  };

  const handleDeleteLayer = async (layerId: string) => {
    if (
      window.confirm("삭제 시 레이어가 영구 삭제 됩니다. 계속 하시겠습니까?")
    ) {
      const newDraft = {
        ...draft,
        layers: draft.layers?.filter((l) => l.id !== layerId) || [],
        sectionOrder: draft.sectionOrder?.filter((id) => id !== layerId) || [],
      };
      setDraft(newDraft);
      if (activeTab === layerId) setActiveTab("hero");

      setIsSaving(true);
      try {
        await updateSettings(newDraft);
        setSuccessMsg("레이어가 영구 삭제되었습니다.");
        setTimeout(() => setSuccessMsg(""), 3000);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const updateLayer = (layerId: string, key: string, value: any) => {
    setDraft({
      ...draft,
      layers:
        draft.layers?.map((l) =>
          l.id === layerId ? { ...l, [key]: value } : l,
        ) || [],
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSuccessMsg("");
    try {
      await updateSettings(draft);
      setSuccessMsg(
        "웹사이트 설정이 저장되었습니다. 미리보기 탭에서 확인해보세요!",
      );
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (e: any) {
      console.error(e);
      alert("저장 중 오류가 발생했습니다: " + (e.message || "알 수 없는 오류"));
    } finally {
      setIsSaving(false);
    }
  };

  const updateHero = (key: keyof SiteSettings["hero"], value: any) => {
    setDraft((prev) => ({ ...prev, hero: { ...prev.hero, [key]: value } }));
  };

  const updateNav = (key: keyof SiteSettings["nav"], value: any) => {
    setDraft((prev) => ({ ...prev, nav: { ...prev.nav, [key]: value } }));
  };

  const updateNavLink = (index: number, key: string, value: string) => {
    const links = [...draft.nav.links];
    links[index] = { ...links[index], [key]: value };
    setDraft({ ...draft, nav: { ...draft.nav, links } });
  };

  const addNavLink = () => {
    const id = Math.random().toString(36).substr(2, 9);
    const links = [...draft.nav.links, { id, label: "새 메뉴", href: "#" }];
    setDraft({ ...draft, nav: { ...draft.nav, links } });
  };

  const deleteNavLink = (index: number) => {
    const links = draft.nav.links.filter((_, i) => i !== index);
    setDraft({ ...draft, nav: { ...draft.nav, links } });
  };

  const updateFeatureItem = (
    index: number,
    key: keyof SiteSettings["features"]["items"][0],
    value: any,
  ) => {
    const newItems = [...draft.features.items];
    newItems[index] = { ...newItems[index], [key]: value };
    setDraft({ ...draft, features: { ...draft.features, items: newItems } });
  };

  const addFeatureItem = () => {
    const newItem = {
      id: Date.now().toString(),
      hidden: false,
      icon: 'Star',
      title: '새로운 기능',
      description: '새로운 기능에 대한 설명을 입력하세요.'
    };
    setDraft({ ...draft, features: { ...draft.features, items: [...draft.features.items, newItem] } });
  };

  const deleteFeatureItem = (index: number) => {
    const newItems = draft.features.items.filter((_, i) => i !== index);
    setDraft({ ...draft, features: { ...draft.features, items: newItems } });
  };

  const updateFeatures = (key: keyof SiteSettings["features"], value: any) => {
    setDraft({ ...draft, features: { ...draft.features, [key]: value } });
  };

  const updateAiDemo = (key: keyof SiteSettings["aiDemo"], value: any) => {
    setDraft({ ...draft, aiDemo: { ...draft.aiDemo, [key]: value } });
  };

  const updatePricing = (key: keyof SiteSettings["pricing"], value: any) => {
    setDraft({ ...draft, pricing: { ...draft.pricing, [key]: value } });
  };

  const updatePartnerSettings = (key: keyof NonNullable<SiteSettings["partnerSettings"]>, value: any) => {
    setDraft({ ...draft, partnerSettings: { ...draft.partnerSettings, [key]: value } });
  };

  const updateSeoSettings = (key: keyof NonNullable<SiteSettings["seoSettings"]>, value: any) => {
    setDraft({ ...draft, seoSettings: { ...draft.seoSettings, [key]: value } as any });
  };

  const updatePromoSettings = (key: keyof NonNullable<SiteSettings["promoSettings"]>, value: any) => {
    setDraft({ ...draft, promoSettings: { ...draft.promoSettings, [key]: value } as any });
  };

  const updatePricingPlan = (
    index: number,
    key: keyof SiteSettings["pricing"]["plans"][0],
    value: any,
  ) => {
    const newPlans = [...draft.pricing.plans];
    newPlans[index] = { ...newPlans[index], [key]: value };
    setDraft({ ...draft, pricing: { ...draft.pricing, plans: newPlans } });
  };

  const updateFooter = (key: keyof SiteSettings["footer"], value: any) => {
    setDraft({ ...draft, footer: { ...draft.footer, [key]: value } });
  };

  const updateFooterContact = (
    key: keyof SiteSettings["footer"]["contact"],
    value: string,
  ) => {
    setDraft({
      ...draft,
      footer: {
        ...draft.footer,
        contact: { ...draft.footer.contact, [key]: value },
      },
    });
  };

  const updateFooterPolicy = (
    key: keyof SiteSettings["footer"]["policies"],
    value: string,
  ) => {
    setDraft({
      ...draft,
      footer: {
        ...draft.footer,
        policies: { ...draft.footer.policies, [key]: value },
      },
    });
  };

  const updateCTA = (key: keyof SiteSettings["cta"], value: any) => {
    setDraft({ ...draft, cta: { ...draft.cta, [key]: value } });
  };

  const updateFooterLink = (
    type: "social" | "company" | "service",
    index: number,
    key: string,
    value: string,
  ) => {
    const footer = { ...draft.footer };
    if (type === "social") {
      const social = [...footer.social];
      social[index] = { ...social[index], [key]: value };
      footer.social = social;
    } else if (type === "company") {
      const company = [...footer.companyLinks];
      company[index] = { ...company[index], [key]: value };
      footer.companyLinks = company;
    } else if (type === "service") {
      const service = [...footer.serviceLinks];
      service[index] = { ...service[index], [key]: value };
      footer.serviceLinks = service;
    }
    setDraft({ ...draft, footer });
  };

  const addPartner = () => {
    const newPartner = {
      id: Date.now().toString(),
      name: '새 파트너사',
      logoImage: '',
      linkUrl: ''
    };
    setDraft({ ...draft, partners: [...(draft.partners || []), newPartner] });
  };

  const updatePartnerField = (index: number, key: string, value: any) => {
    if (!draft.partners) return;
    const newPartners = [...draft.partners];
    newPartners[index] = { ...newPartners[index], [key]: value };
    setDraft({ ...draft, partners: newPartners });
  };

  const deletePartner = (index: number) => {
    if (!draft.partners) return;
    const newPartners = draft.partners.filter((_, i) => i !== index);
    setDraft({ ...draft, partners: newPartners });
  };

  const addFooterLink = (type: "social" | "company" | "service") => {
    const footer = { ...draft.footer };
    const id = Math.random().toString(36).substr(2, 9);
    if (type === "social") {
      footer.social = [
        ...footer.social,
        { id, platform: "Instagram", link: "#", icon: "Instagram" },
      ];
    } else if (type === "company") {
      footer.companyLinks = [
        ...footer.companyLinks,
        { id, label: "새 링크", link: "#" },
      ];
    } else if (type === "service") {
      footer.serviceLinks = [
        ...footer.serviceLinks,
        { id, label: "새 서비스", link: "#" },
      ];
    }
    setDraft({ ...draft, footer });
  };

  const deleteFooterLink = (
    type: "social" | "company" | "service",
    index: number,
  ) => {
    const footer = { ...draft.footer };
    if (type === "social") {
      footer.social = footer.social.filter((_, i) => i !== index);
    } else if (type === "company") {
      footer.companyLinks = footer.companyLinks.filter((_, i) => i !== index);
    } else if (type === "service") {
      footer.serviceLinks = footer.serviceLinks.filter((_, i) => i !== index);
    }
    setDraft({ ...draft, footer });
  };

  const addPricingPlan = () => {
    const newPlan: SiteSettings["pricing"]["plans"][0] = {
      id: Math.random().toString(36).substr(2, 9),
      hidden: false,
      name: "새 요금제",
      subtitle: "설명을 입력하세요",
      monthlyPrice: 0,
      individualDiscountRate: 0,
      features: [
        { id: "f-" + Date.now() + Math.random(), text: "새 기능 상세 내용" },
      ],
      buttonText: "시작하기",
      buttonLink: "#",
      buttonStyle: "outline",
      isPopular: false,
      popularText: "",
    };
    setDraft({
      ...draft,
      pricing: { ...draft.pricing, plans: [...draft.pricing.plans, newPlan] },
    });
  };

  const deletePricingPlan = (index: number) => {
    if (!window.confirm("정말 이 요금제를 삭제하시겠습니까?")) return;
    const newPlans = draft.pricing.plans.filter((_, i) => i !== index);
    setDraft({ ...draft, pricing: { ...draft.pricing, plans: newPlans } });
  };

  const addPlanFeature = (planIndex: number) => {
    const newPlans = [...draft.pricing.plans];
    const newFeatures = [
      ...newPlans[planIndex].features,
      { id: "f-" + Date.now() + Math.random(), text: "새 기능 상세 내용" },
    ];
    newPlans[planIndex] = { ...newPlans[planIndex], features: newFeatures };
    setDraft({ ...draft, pricing: { ...draft.pricing, plans: newPlans } });
  };

  const updatePlanFeature = (
    planIndex: number,
    featureIndex: number,
    text: string,
  ) => {
    const newPlans = [...draft.pricing.plans];
    const newFeatures = [...newPlans[planIndex].features];
    newFeatures[featureIndex] = { ...newFeatures[featureIndex], text };
    newPlans[planIndex] = { ...newPlans[planIndex], features: newFeatures };
    setDraft({ ...draft, pricing: { ...draft.pricing, plans: newPlans } });
  };

  const deletePlanFeature = (planIndex: number, featureIndex: number) => {
    const newPlans = [...draft.pricing.plans];
    const newFeatures = newPlans[planIndex].features.filter(
      (_, i) => i !== featureIndex,
    );
    newPlans[planIndex] = { ...newPlans[planIndex], features: newFeatures };
    setDraft({ ...draft, pricing: { ...draft.pricing, plans: newPlans } });
  };

  const addLayerButton = (layerId: string) => {
    const layer = draft.layers?.find((l) => l.id === layerId);
    if (!layer) return;
    const buttons = layer.buttons || [];
    updateLayer(layerId, "buttons", [
      ...buttons,
      {
        label: "",
        actionType: "section",
        targetId: "",
        linkUrl: "",
        colorClass: "bg-brand-primary text-white",
      },
    ]);
  };

  const updateLayerButton = (layerId: string, idx: number, updates: any) => {
    const layer = draft.layers?.find((l) => l.id === layerId);
    if (!layer) return;
    const buttons = [...(layer.buttons || [])];
    buttons[idx] = { ...buttons[idx], ...updates };
    updateLayer(layerId, "buttons", buttons);
  };

  const removeLayerButton = (layerId: string, idx: number) => {
    const layer = draft.layers?.find((l) => l.id === layerId);
    if (!layer) return;
    const buttons = layer.buttons?.filter((_, i) => i !== idx) || [];
    updateLayer(layerId, "buttons", buttons);
  };

  // --- Drag and Drop Handlers ---
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleFeaturesDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = draft.features.items.findIndex(
        (item) => item.id === active.id,
      );
      const newIndex = draft.features.items.findIndex(
        (item) => item.id === over.id,
      );
      setDraft({
        ...draft,
        features: {
          ...draft.features,
          items: arrayMove(draft.features.items, oldIndex, newIndex),
        },
      });
    }
  };

  const handlePartnersDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && draft.partners) {
      const oldIndex = draft.partners.findIndex((p) => p.id === active.id);
      const newIndex = draft.partners.findIndex((p) => p.id === over.id);
      setDraft({
        ...draft,
        partners: arrayMove(draft.partners, oldIndex, newIndex),
      });
    }
  };

  const handleBgImageDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const bgArr = draft.hero.bgImages || [];

      const oldIndex = bgArr.findIndex((img: any) => img.id === active.id);
      const newIndex = bgArr.findIndex((img: any) => img.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newArr = arrayMove(bgArr, oldIndex, newIndex);
        const firstImg: any = newArr[0];
        const newBgImage = firstImg ? (typeof firstImg === 'string' ? firstImg : firstImg.url) : '';
        
        setDraft((prev: any) => ({
          ...prev,
          hero: {
            ...prev.hero,
            bgImages: newArr,
            bgImage: newBgImage
          }
        }));
      }
    }
  };

  const handlePricingFeaturesDragEnd = (
    planIndex: number,
    event: DragEndEvent,
  ) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const newPlans = [...draft.pricing.plans];
      const features = [...newPlans[planIndex].features];
      const oldIndex = features.findIndex((f) => f.id === active.id);
      const newIndex = features.findIndex((f) => f.id === over.id);

      newPlans[planIndex] = {
        ...newPlans[planIndex],
        features: arrayMove(features, oldIndex, newIndex),
      };

      setDraft({ ...draft, pricing: { ...draft.pricing, plans: newPlans } });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-20"
    >
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            홈페이지 에디터 (CMS)
          </h1>
          <p className="text-gray-500 font-medium">
            코딩 없이 클릭만으로 웹사이트의 정보와 디자인을 수정하세요.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-brand-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-primary/90 transition-all disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {isSaving ? "저장 중..." : "변경사항 저장"}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="whitespace-pre-wrap text-sm font-medium">{error}</div>
        </div>
      )}
      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-3 font-bold text-sm">
          <Layout className="w-5 h-5 shrink-0" />
          {successMsg}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 relative">
        {/* Sidebar Navigation for Editor */}
        <div
          ref={sidebarRef}
          className={`fixed lg:relative z-[100] lg:z-auto transition-all duration-300 ease-in-out ${
            sidebarVisible
              ? "left-0 opacity-100"
              : "-left-full lg:left-0 lg:opacity-0 lg:pointer-events-none lg:w-0"
          } w-72 h-[calc(100vh-200px)] lg:h-auto overflow-y-auto lg:overflow-visible bg-white lg:bg-transparent shadow-xl lg:shadow-none p-4 lg:p-0 rounded-r-2xl lg:rounded-none border-r lg:border-r-0 border-gray-100 flex flex-col`}
        >
          <div className="flex items-center justify-between lg:hidden mb-4 border-b pb-2">
            <span className="font-bold text-gray-900">편집 메뉴</span>
            <button
              onClick={() => setSidebarVisible(false)}
              className="p-1 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex flex-col gap-1">
            <TabButton
              active={activeTab === "nav"}
              onClick={() => setActiveTab("nav")}
              icon={<Layout className="w-4 h-4" />}
              label="상단바 (Navbar)"
            />
            <TabButton
              active={activeTab === "hero"}
              onClick={() => setActiveTab("hero")}
              icon={<Image className="w-4 h-4" />}
              label="히어로 섹션"
            />

            <div className="my-1 border-t border-gray-100" />

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleSidebarDragEnd}
            >
              <SortableContext
                items={draft.sectionOrder || []}
                strategy={verticalListSortingStrategy}
              >
                {(draft.sectionOrder || []).map((sectionId) => {
                  let label = sectionId;
                  let icon = <List className="w-4 h-4" />;
                  let isHidden = false;
                  
                  if (sectionId === "features") {
                    label = "주요 기능";
                    isHidden = draft.features?.hidden || false;
                  } else if (sectionId === "aiDemo") {
                    label = "AI 헤어모델";
                    icon = <Smartphone className="w-4 h-4" />;
                    isHidden = draft.aiDemo?.hidden || false;
                  } else if (sectionId === "pricing") {
                    label = "요금제 설정";
                    icon = <CreditCard className="w-4 h-4" />;
                    isHidden = draft.pricing?.hidden || false;
                  } else if (sectionId === "partners") {
                    label = "파트너사 관리";
                    icon = <Users className="w-4 h-4" />;
                    isHidden = draft.partnerSettings?.hidden || false;
                  } else if (sectionId.startsWith("layer_")) {
                    const layer = draft.layers?.find((l) => l.id === sectionId);
                    if (!layer) return null;
                    return (
                      <SortableSidebarItem
                        key={sectionId}
                        id={sectionId}
                        label={layer.name || "레이어"}
                        icon={<Settings className="w-4 h-4" />}
                        active={activeTab === sectionId}
                        hidden={layer.hidden}
                        onClick={() => setActiveTab(sectionId)}
                        onToggleHide={() =>
                          updateLayer(sectionId, "hidden", !layer.hidden)
                        }
                      />
                    );
                  }

                  return (
                    <SortableSidebarItem
                      key={sectionId}
                      id={sectionId}
                      label={label}
                      icon={icon}
                      active={activeTab === sectionId}
                      hidden={isHidden}
                      onClick={() => setActiveTab(sectionId)}
                      onToggleHide={() => {
                        setDraft((prev) => {
                          const newDraft = { ...prev };
                          if (sectionId === "features" && newDraft.features) {
                             newDraft.features = { ...newDraft.features, hidden: !newDraft.features.hidden };
                          } else if (sectionId === "aiDemo" && newDraft.aiDemo) {
                             newDraft.aiDemo = { ...newDraft.aiDemo, hidden: !newDraft.aiDemo.hidden };
                          } else if (sectionId === "pricing" && newDraft.pricing) {
                             newDraft.pricing = { ...newDraft.pricing, hidden: !newDraft.pricing.hidden };
                          } else if (sectionId === "partners") {
                             newDraft.partnerSettings = { ...newDraft.partnerSettings, hidden: !newDraft.partnerSettings?.hidden };
                          }
                          return newDraft;
                        });
                      }}
                    />
                  );
                })}
              </SortableContext>
            </DndContext>

            <div className="my-1 border-t border-gray-100 pt-2 px-2">
              <button
                onClick={handleAddLayer}
                className="w-full py-2 flex items-center justify-center gap-2 text-sm font-bold text-brand-primary border border-brand-primary/20 bg-brand-primary/5 rounded-lg hover:bg-brand-primary/10 transition-colors"
              >
                <Plus className="w-4 h-4" /> 레이어 추가
              </button>
            </div>

            <div className="my-1 border-t border-gray-100 px-2" />
            <TabButton
              active={activeTab === "seo"}
              onClick={() => setActiveTab("seo")}
              icon={<Search className="w-4 h-4" />}
              label="SEO 최적화 관리"
            />
            <TabButton
              active={activeTab === "parking"}
              onClick={() => setActiveTab("parking")}
              icon={<AlertTriangle className="w-4 h-4" />}
              label="파킹 페이지 (공사중)"
            />
            <TabButton
              active={activeTab === "popup"}
              onClick={() => setActiveTab("popup")}
              icon={<Megaphone className="w-4 h-4" />}
              label="이벤트 팝업"
            />
            <TabButton
              active={activeTab === "event_posts"}
              onClick={() => setActiveTab("event_posts")}
              icon={<List className="w-4 h-4" />}
              label="이벤트 게시글 관리"
            />
            <TabButton
              active={activeTab === "promo"}
              onClick={() => setActiveTab("promo")}
              icon={<Megaphone className="w-4 h-4" />}
              label="AI 마케팅 자동화"
            />
            <TabButton
              active={activeTab === "credit_settings"}
              onClick={() => setActiveTab("credit_settings")}
              icon={<CreditCard className="w-4 h-4" />}
              label="크레딧 설정"
            />
            <TabButton
              active={activeTab === "footer"}
              onClick={() => setActiveTab("footer")}
              icon={<Settings className="w-4 h-4" />}
              label="푸터 (Footer) 설정"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="mb-4 flex items-center lg:items-start">
            <button
              ref={toggleBtnRef}
              onClick={() => setSidebarVisible(!sidebarVisible)}
              className={`p-2 bg-white border border-gray-100 shadow-sm rounded-xl hover:bg-gray-50 transition-all group flex items-center gap-2 ${!sidebarVisible ? "ring-2 ring-brand-primary/20 bg-brand-primary/5" : ""}`}
              title={sidebarVisible ? "메뉴 숨기기" : "메뉴 보이기"}
            >
              {sidebarVisible ? (
                <GripVertical className="w-5 h-5 text-gray-500 group-hover:text-brand-primary" />
              ) : (
                <List className="w-5 h-5 text-brand-primary" />
              )}
              {!sidebarVisible && (
                <span className="text-sm font-bold text-brand-primary pr-1">
                  편집 메뉴 열기
                </span>
              )}
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            {activeTab === "nav" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                    <Image className="w-5 h-5 text-brand-primary" /> 로고 설정
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        로고 타입
                      </label>
                      <select
                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-brand-primary outline-none"
                        value={draft.nav.logoType}
                        onChange={(e) => updateNav("logoType", e.target.value)}
                      >
                        <option value="text">텍스트 (Text)</option>
                        <option value="image">이미지 (Image)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        로고 내용 (Text or URL)
                      </label>
                      {draft.nav.logoType === "text" ? (
                        <input
                          type="text"
                          className="w-full border rounded-lg p-2.5 outline-none focus:ring-2"
                          value={draft.nav.logoText}
                          onChange={(e) =>
                            updateNav("logoText", e.target.value)
                          }
                        />
                      ) : (
                        <input
                          type="text"
                          className="w-full border rounded-lg p-2.5 outline-none focus:ring-2"
                          placeholder="https://..."
                          value={draft.nav.logoImage}
                          onChange={(e) =>
                            updateNav("logoImage", e.target.value)
                          }
                        />
                      )}
                    </div>
                  </div>
                  {draft.nav.logoType === "image" && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          로고 가로 크기 (Width)
                        </label>
                        <input
                          type="text"
                          className="w-full border rounded-lg p-2.5 outline-none focus:ring-2"
                          placeholder="auto 또는 120px"
                          value={draft.nav.logoWidth}
                          onChange={(e) =>
                            updateNav("logoWidth", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          로고 세로 크기 (Height)
                        </label>
                        <input
                          type="text"
                          className="w-full border rounded-lg p-2.5 outline-none focus:ring-2"
                          placeholder="32px 또는 100%"
                          value={draft.nav.logoHeight}
                          onChange={(e) =>
                            updateNav("logoHeight", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                    <List className="w-5 h-5 text-brand-primary" /> 내비게이션
                    메뉴 관리
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-xl border">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-sm">메인 메뉴 항목</h4>
                      <button
                        onClick={addNavLink}
                        className="text-xs font-bold text-brand-primary flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> 메뉴 추가
                      </button>
                    </div>
                    <div className="space-y-2">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleNavLinkDragEnd}
                      >
                        <SortableContext
                          items={draft.nav.links.map((l) => l.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {draft.nav.links.map((link, idx) => (
                            <SortableNavLink
                              key={link.id}
                              link={link}
                              index={idx}
                              onUpdate={updateNavLink}
                              onDelete={deleteNavLink}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                    <Icons.User className="w-5 h-5 text-brand-primary" /> 마이페이지 메뉴명 관리
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-xl border grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'aiModel', label: 'AI 헤어모델 생성' },
                      { key: 'csAdmin', label: 'CS 관리자 페이지' },
                      { key: 'siteEditor', label: '홈페이지 편집' },
                      { key: 'saasAdmin', label: 'SaaS 관리자 대시보드' },
                      { key: 'shop', label: 'QR 서비스 관리' },
                      { key: 'profile', label: '프로필 정보' },
                      { key: 'portfolio', label: '포트폴리오' },
                      { key: 'subscription', label: '구독관리' },
                      { key: 'billing', label: '결제관리' },
                      { key: 'credits', label: '크레딧 관리' },
                      { key: 'reports', label: '보고서' },
                      { key: 'instagram', label: '인스타그램 계정관리' },
                      { key: 'marketing', label: '마케팅 보고서' },
                      { key: 'referral', label: '친구 추천 (안내)' },
                    ].map((item) => (
                      <div key={item.key} className="relative">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-gray-700">
                            {item.label}
                          </label>
                          <button
                            onClick={() => {
                              const currentVisibility = draft.nav.mypageMenuVisibility || {};
                              updateNav("mypageMenuVisibility", {
                                ...currentVisibility,
                                [item.key]: !currentVisibility[item.key]
                              });
                            }}
                            className={`p-1 rounded transition-colors ${draft.nav.mypageMenuVisibility?.[item.key] ? 'text-gray-400 bg-gray-100' : 'text-brand-primary bg-brand-primary/10'}`}
                            title={draft.nav.mypageMenuVisibility?.[item.key] ? "메뉴 숨김 해제" : "메뉴 숨기기"}
                          >
                            {draft.nav.mypageMenuVisibility?.[item.key] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                        <input
                          type="text"
                          className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 text-sm"
                          value={(draft.nav.mypageMenu as any)?.[item.key] || item.label}
                          onChange={(e) =>
                            updateNav("mypageMenu", {
                              ...(draft.nav.mypageMenu || {}),
                              [item.key]: e.target.value
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "hero" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                    <Image className="w-5 h-5 text-brand-primary" /> 배경 설정
                    (Background)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        기본 배경색
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          className="w-10 h-10 rounded box-content border-0 cursor-pointer"
                          value={draft.hero.bgColor || '#000000'}
                          onChange={(e) => updateHero('bgColor', e.target.value)}
                        />
                        <input
                          type="text"
                          className="flex-1 border rounded-lg p-2.5 text-sm outline-none font-mono uppercase"
                          value={draft.hero.bgColor || '#000000'}
                          onChange={(e) => updateHero('bgColor', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        배경 타입
                      </label>
                      <select
                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-brand-primary outline-none"
                        value={draft.hero.bgType}
                        onChange={(e) => updateHero("bgType", e.target.value)}
                      >
                        <option value="image">이미지 (Image)</option>
                        <option value="video">동영상 (Video)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        배경 애니메이션
                      </label>
                      <select
                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-brand-primary outline-none"
                        value={draft.hero.bgAnimation}
                        onChange={(e) =>
                          updateHero("bgAnimation", e.target.value)
                        }
                      >
                        <option value="zoom-out">서서히 확대 (Zoom-out)</option>
                        <option value="fade-slider">부드러운 전환 슬라이더 (Fade Slider)</option>
                        <option value="zoom-fade-slider">줌아웃 페이드 슬라이더 (Zoom-Fade Slider)</option>
                        <option value="none">없음 (None)</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {draft.hero.bgType === "image" ? (
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-sm font-bold text-gray-700">
                            배경 이미지 URL (여러 개 등록 가능)
                          </label>
                          <label className="cursor-pointer bg-brand-primary text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-brand-primary/90 flex items-center gap-1 transition-colors">
                            {isUploadingBgImage ? <Loader className="w-3 h-3 animate-spin"/> : <Plus className="w-3 h-3" />}
                            기기에서 업로드
                            <input type="file" accept="image/*" className="hidden" onChange={handleBgImageUpload} disabled={isUploadingBgImage} />
                          </label>
                        </div>
                        
                        {/* List of bg images */}
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleBgImageDragEnd}
                        >
                          <SortableContext
                            items={(draft.hero.bgImages || []).map((img: any) => img.id || (typeof img === 'string' ? img : Date.now().toString()))}
                            strategy={verticalListSortingStrategy}
                          >
                            {(draft.hero.bgImages || []).map((imgRaw: any, idx: number, arr: any[]) => {
                              const imgUrl = typeof imgRaw === 'string' ? imgRaw : imgRaw.url;
                              const imgId = typeof imgRaw === 'string' ? `fallback-${idx}` : imgRaw.id;
                              
                              return (
                                <SortableBgImageItem
                                  key={`bgimage-${imgId}`}
                                  id={imgId}
                                  url={imgUrl}
                                  idx={idx}
                                  onUpdate={(i, newUrl) => {
                                    const newArr = [...arr];
                                    if (typeof newArr[i] === 'string') {
                                      newArr[i] = { id: `img-${Date.now()}-${i}`, url: newUrl };
                                    } else {
                                      newArr[i] = { ...newArr[i], url: newUrl };
                                    }
                                    updateHero("bgImages", newArr);
                                    if (i === 0) updateHero("bgImage", newUrl);
                                  }}
                                  onDelete={(i) => {
                                    if (arr.length <= 1) return;
                                    const newArr = arr.filter((_, index) => index !== i);
                                    updateHero("bgImages", newArr);
                                    const firstImg = newArr[0];
                                    if (i === 0 || idx === 0) updateHero("bgImage", firstImg ? (typeof firstImg === 'string' ? firstImg : firstImg.url) : '');
                                  }}
                                  onUpload={handleBgImageUpload}
                                  isUploading={isUploadingBgImage}
                                  onPreview={setPreviewImage}
                                />
                              );
                            })}
                          </SortableContext>
                        </DndContext>
                        
                        {/* Fallback for completely empty array */}
                        {!(draft.hero.bgImages && draft.hero.bgImages.length > 0) && !draft.hero.bgImage && (
                          <div className="flex gap-2 mb-2">
                             <input
                              type="text"
                              className="flex-1 border rounded-lg p-2.5 outline-none focus:ring-2 bg-white"
                              placeholder="https://..."
                              value=""
                              onChange={(e) => {
                                updateHero("bgImages", [{ id: Date.now().toString(), url: e.target.value }]);
                                updateHero("bgImage", e.target.value);
                              }}
                            />
                          </div>
                        )}
                        
                        <button
                          type="button"
                          className="mt-2 text-sm text-brand-primary font-medium flex items-center gap-1 hover:text-brand-primary/80 transition-colors"
                          onClick={() => {
                            const arr = draft.hero.bgImages || [];
                            updateHero("bgImages", [...arr, { id: `img-${Date.now()}-new`, url: "" }]);
                          }}
                        >
                          <Plus className="w-4 h-4" /> 이미지 URL 추가
                        </button>
                        
                        {(draft.hero.bgAnimation === 'fade-slider' || draft.hero.bgAnimation === 'zoom-fade-slider') && (
                          <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2">
                                슬라이더 전환 간격 (초)
                              </label>
                              <div className="flex items-center gap-3">
                                <input
                                  type="number"
                                  min="1"
                                  max="60"
                                  className="w-24 border rounded-lg p-2 outline-none focus:ring-2 focus:ring-brand-primary text-center font-mono"
                                  value={draft.hero.bgTransitionTime || 3}
                                  onChange={(e) => updateHero("bgTransitionTime", parseInt(e.target.value) || 3)}
                                />
                                <span className="text-sm text-gray-500 font-medium">초 간격으로 전환</span>
                              </div>
                            </div>
                            
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                                checked={draft.hero.bgShowFirstImageImmediately ?? true}
                                onChange={(e) => updateHero("bgShowFirstImageImmediately", e.target.checked)}
                              />
                              <span className="text-sm font-bold text-gray-700">처음 접속시 첫 이미지 즉시 표시 (애니메이션 생략)</span>
                            </label>
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-400 mt-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          * 첫 번째 이미지가 기본으로 노출됩니다. 여러 이미지를 등록하고 <b>'부드러운 전환 슬라이더'</b>를 선택하면 순차적으로 바뀝니다.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          배경 동영상 URL (.mp4)
                        </label>
                        <input
                          type="text"
                          className="w-full border rounded-lg p-2.5 outline-none focus:ring-2"
                          placeholder="https://..."
                          value={draft.hero.bgVideo}
                          onChange={(e) =>
                            updateHero("bgVideo", e.target.value)
                          }
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          * 비어있을 경우 기본 영상이 노출됩니다.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                    <Droplet className="w-5 h-5 text-brand-primary" /> 배경 오버레이 (그라데이션)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">시작 컬러 (좌측/상단)</label>
                        <div className="flex gap-2">
                          <input 
                            type="color" 
                            className="w-10 h-10 rounded box-content border-0 cursor-pointer" 
                            value={draft.hero.overlayStartColor || '#ffffff'}
                            onChange={(e) => updateHero('overlayStartColor', e.target.value)}
                          />
                          <input 
                            type="text" 
                            className="flex-1 border rounded-lg p-2 text-sm outline-none font-mono uppercase" 
                            value={draft.hero.overlayStartColor || '#ffffff'}
                            onChange={(e) => updateHero('overlayStartColor', e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          시작 투명도: {draft.hero.overlayStartOpacity ?? 100}%
                        </label>
                        <input 
                          type="range" min="0" max="100" 
                          className="w-full accent-brand-primary"
                          value={draft.hero.overlayStartOpacity ?? 100}
                          onChange={(e) => updateHero('overlayStartOpacity', parseInt(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">종료 컬러 (우측/하단)</label>
                        <div className="flex gap-2">
                          <input 
                            type="color" 
                            className="w-10 h-10 rounded box-content border-0 cursor-pointer" 
                            value={draft.hero.overlayEndColor || '#ffffff'}
                            onChange={(e) => updateHero('overlayEndColor', e.target.value)}
                          />
                          <input 
                            type="text" 
                            className="flex-1 border rounded-lg p-2 text-sm outline-none font-mono uppercase" 
                            value={draft.hero.overlayEndColor || '#ffffff'}
                            onChange={(e) => updateHero('overlayEndColor', e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          종료 투명도: {draft.hero.overlayEndOpacity ?? 0}%
                        </label>
                        <input 
                          type="range" min="0" max="100" 
                          className="w-full accent-brand-primary"
                          value={draft.hero.overlayEndOpacity ?? 0}
                          onChange={(e) => updateHero('overlayEndOpacity', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2 pt-8">
                    <Type className="w-5 h-5 text-brand-primary" /> 텍스트 &
                    노출
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="checkbox"
                          id="showBadge"
                          checked={draft.hero.showBadge}
                          onChange={(e) =>
                            updateHero("showBadge", e.target.checked)
                          }
                          className="rounded text-brand-primary"
                        />
                        <label
                          htmlFor="showBadge"
                          className="text-sm font-bold text-gray-700"
                        >
                          배지 (Badge) 보이게 하기
                        </label>
                      </div>
                      {draft.hero.showBadge && (
                        <input
                          type="text"
                          className="w-full border rounded-lg p-2.5 mt-1 outline-none focus:ring-2"
                          value={draft.hero.badgeText}
                          onChange={(e) =>
                            updateHero("badgeText", e.target.value)
                          }
                        />
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                      <div className="md:col-span-3">
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          메인 타이틀 (HTML 지원)
                        </label>
                        <textarea
                          className="w-full border rounded-lg p-2.5 h-20 outline-none focus:ring-2"
                          value={draft.hero.title}
                          onChange={(e) => updateHero("title", e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          글자 색상
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            className="w-10 h-10 rounded border cursor-pointer shrink-0"
                            value={draft.hero.titleColor || "#0b0f19"}
                            onChange={(e) => updateHero("titleColor", e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="기본값 사용"
                            className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 text-xs"
                            value={draft.hero.titleColor || ""}
                            onChange={(e) => updateHero("titleColor", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                      <div className="md:col-span-3">
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          서브 타이틀
                        </label>
                        <textarea
                          className="w-full border rounded-lg p-2.5 h-20 outline-none focus:ring-2"
                          value={draft.hero.subtitle}
                          onChange={(e) => updateHero("subtitle", e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          글자 색상
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            className="w-10 h-10 rounded border cursor-pointer shrink-0"
                            value={draft.hero.subtitleColor || "#4b5563"}
                            onChange={(e) => updateHero("subtitleColor", e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="기본값 사용"
                            className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 text-xs"
                            value={draft.hero.subtitleColor || ""}
                            onChange={(e) => updateHero("subtitleColor", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                    <MousePointerClick className="w-5 h-5 text-brand-primary" />{" "}
                    버튼 설정
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-xl border">
                      <h4 className="font-bold text-sm mb-3">
                        메인 버튼 [기본]
                      </h4>
                      <input
                        type="text"
                        className="w-full border rounded-lg p-2 mb-2 text-sm"
                        placeholder="버튼명"
                        value={draft.hero.primaryBtnBase}
                        onChange={(e) =>
                          updateHero("primaryBtnBase", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        className="w-full border rounded-lg p-2 text-sm"
                        placeholder="링크 (# 또는 URL)"
                        value={draft.hero.primaryBtnLink}
                        onChange={(e) =>
                          updateHero("primaryBtnLink", e.target.value)
                        }
                      />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border">
                      <h4 className="font-bold text-sm mb-3">
                        서브 버튼 [도입안내]
                      </h4>
                      <input
                        type="text"
                        className="w-full border rounded-lg p-2 mb-2 text-sm"
                        placeholder="버튼명"
                        value={draft.hero.secondaryBtnBase}
                        onChange={(e) =>
                          updateHero("secondaryBtnBase", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        className="w-full border rounded-lg p-2 text-sm"
                        placeholder="링크 (# 또는 URL)"
                        value={draft.hero.secondaryBtnLink}
                        onChange={(e) =>
                          updateHero("secondaryBtnLink", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-brand-primary" /> 통계
                    지표 토글
                  </h3>
                  <div className="flex flex-wrap gap-6 bg-gray-50 p-4 rounded-xl border">
                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded text-brand-primary"
                        checked={draft.hero.metrics.showVisits}
                        onChange={(e) =>
                          updateHero("metrics", {
                            ...draft.hero.metrics,
                            showVisits: e.target.checked,
                          })
                        }
                      />{" "}
                      누적 방문자
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded text-brand-primary"
                        checked={draft.hero.metrics.showToday}
                        onChange={(e) =>
                          updateHero("metrics", {
                            ...draft.hero.metrics,
                            showToday: e.target.checked,
                          })
                        }
                      />{" "}
                      오늘 방문자
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded text-brand-primary"
                        checked={draft.hero.metrics.showUsers}
                        onChange={(e) =>
                          updateHero("metrics", {
                            ...draft.hero.metrics,
                            showUsers: e.target.checked,
                          })
                        }
                      />{" "}
                      가입자 수 (총회원)
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded text-brand-primary"
                        checked={draft.hero.metrics.showActive}
                        onChange={(e) =>
                          updateHero("metrics", {
                            ...draft.hero.metrics,
                            showActive: e.target.checked,
                          })
                        }
                      />{" "}
                      활성유저
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded text-brand-primary"
                        checked={draft.hero.metrics.showSatisfaction}
                        onChange={(e) =>
                          updateHero("metrics", {
                            ...draft.hero.metrics,
                            showSatisfaction: e.target.checked,
                          })
                        }
                      />{" "}
                      만족도
                    </label>
                  </div>
                  <div className="mt-4 flex items-center gap-4">
                    <label className="text-sm font-bold text-gray-700 whitespace-nowrap">
                      지표 글자 색상
                    </label>
                    <div className="flex gap-2 w-full max-w-xs">
                      <input
                        type="color"
                        className="w-10 h-10 rounded border cursor-pointer shrink-0"
                        value={draft.hero.metricsColor || "#0b0f19"}
                        onChange={(e) => updateHero("metricsColor", e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="기본값 사용"
                        className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 text-xs"
                        value={draft.hero.metricsColor || ""}
                        onChange={(e) => updateHero("metricsColor", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "features" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <div className="flex items-center justify-between mb-4 border-b pb-2">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Type className="w-5 h-5 text-brand-primary" /> 텍스트 & 노출
                    </h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={draft.features?.useWhiteBg || false}
                        onChange={(e) => updateFeatures("useWhiteBg", e.target.checked)}
                        className="w-4 h-4 accent-brand-primary"
                      />
                      <span className="text-sm font-medium text-gray-700">배경색 화이트(bg-white) 적용</span>
                    </label>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        메인 타이틀 (HTML 지원)
                      </label>
                      <textarea
                        className="w-full border rounded-lg p-2.5 h-20 outline-none focus:ring-2"
                        value={draft.features.title || ""}
                        onChange={(e) =>
                          updateFeatures("title", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        서브 타이틀
                      </label>
                      <textarea
                        className="w-full border rounded-lg p-2.5 h-24 outline-none focus:ring-2"
                        value={draft.features.subtitle || ""}
                        onChange={(e) =>
                          updateFeatures("subtitle", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2 mt-8">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <List className="w-5 h-5 text-brand-primary" /> 주요 기능
                    (Features) 리스트
                  </h3>
                  <button
                    onClick={addFeatureItem}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-brand-primary bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100"
                  >
                    <Plus className="w-4 h-4" /> 기능 추가
                  </button>
                </div>
                <p className="text-gray-500 mb-6 text-sm font-medium">
                  드래그앤드롭으로 순서를 변경하고 내용을 직접 수정할 수
                  있습니다.
                </p>

                <div className="space-y-4">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleFeaturesDragEnd}
                  >
                    <SortableContext
                      items={draft.features.items.map((i) => i.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {draft.features.items.map((item, idx) => (
                        <SortableFeatureCard
                          key={item.id}
                          item={item}
                          idx={idx}
                          onUpdate={updateFeatureItem}
                          onDelete={deleteFeatureItem}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              </div>
            )}

            {activeTab === "aiDemo" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <div className="flex items-center justify-between mb-4 border-b pb-2">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-brand-primary" /> 앱
                      다운로드 및 안내
                    </h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={draft.aiDemo?.useWhiteBg || false}
                        onChange={(e) => updateAiDemo("useWhiteBg", e.target.checked)}
                        className="w-4 h-4 accent-brand-primary"
                      />
                      <span className="text-sm font-medium text-gray-700">배경색 화이트(bg-white) 적용</span>
                    </label>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="checkbox"
                          id="showAiBadge"
                          checked={draft.aiDemo.showBadge}
                          onChange={(e) =>
                            updateAiDemo("showBadge", e.target.checked)
                          }
                          className="rounded text-brand-primary"
                        />
                        <label
                          htmlFor="showAiBadge"
                          className="text-sm font-bold text-gray-700"
                        >
                          배지 (Badge) 보이게 하기
                        </label>
                      </div>
                      {draft.aiDemo.showBadge && (
                        <input
                          type="text"
                          className="w-full border rounded-lg p-2.5 mt-1 outline-none focus:ring-2"
                          value={draft.aiDemo.badgeText}
                          onChange={(e) =>
                            updateAiDemo("badgeText", e.target.value)
                          }
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        섹션 타이틀 (HTML 지원)
                      </label>
                      <textarea
                        className="w-full border rounded-lg p-2.5 h-20 outline-none focus:ring-2"
                        value={draft.aiDemo.title}
                        onChange={(e) => updateAiDemo("title", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        섹션 내용 (HTML 지원)
                      </label>
                      <textarea
                        className="w-full border rounded-lg p-2.5 h-24 outline-none focus:ring-2"
                        value={draft.aiDemo.subtitle}
                        onChange={(e) =>
                          updateAiDemo("subtitle", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                    <MousePointerClick className="w-5 h-5 text-brand-primary" />{" "}
                    버튼 및 앱스토어 링크
                  </h3>
                  <div className="space-y-4 bg-gray-50 p-4 rounded-xl border">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        앱 체험 블러 효과 강도 ({draft.aiDemo.blurStrength}px)
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="0"
                          max="20"
                          step="0.1"
                          className="flex-1 accent-brand-primary"
                          value={draft.aiDemo.blurStrength}
                          onChange={(e) =>
                            updateAiDemo("blurStrength", Number(e.target.value))
                          }
                        />
                        <input
                          type="number"
                          className="w-20 border rounded-lg p-2 text-sm outline-none focus:ring-2"
                          value={draft.aiDemo.blurStrength}
                          onChange={(e) =>
                            updateAiDemo("blurStrength", Number(e.target.value))
                          }
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        * 수치가 낮을수록 배경이 더 선명하게 보입니다. (권장:
                        1~3)
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        CTO 버튼 이름
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded-lg p-2.5 outline-none focus:ring-2"
                        value={draft.aiDemo.ctaText}
                        onChange={(e) =>
                          updateAiDemo("ctaText", e.target.value)
                        }
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          App Store 링크
                        </label>
                        <input
                          type="text"
                          className="w-full border rounded-lg p-2.5 outline-none focus:ring-2"
                          value={draft.aiDemo.appStoreLink}
                          onChange={(e) =>
                            updateAiDemo("appStoreLink", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          Google Play 링크
                        </label>
                        <input
                          type="text"
                          className="w-full border rounded-lg p-2.5 outline-none focus:ring-2"
                          value={draft.aiDemo.playStoreLink}
                          onChange={(e) =>
                            updateAiDemo("playStoreLink", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab.startsWith("layer_") && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {(() => {
                  const layer = draft.layers?.find((l) => l.id === activeTab);
                  if (!layer) return null;
                  return (
                    <>
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <input
                          type="text"
                          className="text-2xl font-black text-gray-900 border-none outline-none focus:ring-2 focus:ring-brand-primary rounded p-1 w-full shrink"
                          value={layer.name}
                          onChange={(e) =>
                            updateLayer(layer.id, "name", e.target.value)
                          }
                        />
                        <button
                          onClick={() => handleDeleteLayer(layer.id)}
                          className="px-4 py-2 flex items-center gap-2 text-sm font-bold text-red-500 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors shrink-0"
                        >
                          <Trash2 className="w-4 h-4" /> 삭제
                        </button>
                      </div>

                      <div className="flex items-center gap-4 mb-6">
                        <button
                          onClick={() =>
                            updateLayer(layer.id, "hidden", !layer.hidden)
                          }
                          className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${layer.hidden ? "bg-gray-50" : "bg-brand-primary/5 border-brand-primary/20"}`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${layer.hidden ? "bg-gray-200 text-gray-400" : "bg-brand-primary text-white"}`}
                            >
                              {layer.hidden ? (
                                <X className="w-4 h-4" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </div>
                            <div className="text-left">
                              <div className="font-bold text-gray-900">
                                {layer.name} 섹션 노출
                              </div>
                              <div className="text-xs text-gray-500">
                                {layer.hidden
                                  ? "현재 숨김 처리됨 (사이트에서만 안보임)"
                                  : "현재 웹사이트에 노출 중"}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-bold ${layer.hidden ? "bg-gray-200 text-gray-500" : "bg-brand-primary text-white"}`}
                          >
                            {layer.hidden ? "OFF" : "ON"}
                          </div>
                        </button>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                          <Layout className="w-5 h-5 text-brand-primary" />{" "}
                          레이어 옵션
                        </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                              <div className="flex items-center gap-3 p-3 border rounded-xl bg-gray-50/50">
                                <input
                                  type="checkbox"
                                  id={`useGlassCard_${layer.id}`}
                                  checked={layer.useGlassCard !== false}
                                  onChange={(e) =>
                                    updateLayer(
                                      layer.id,
                                      "useGlassCard",
                                      e.target.checked,
                                    )
                                  }
                                  className="w-5 h-5 accent-brand-primary cursor-pointer"
                                />
                                <label
                                  htmlFor={`useGlassCard_${layer.id}`}
                                  className="text-sm font-bold text-gray-700 cursor-pointer"
                                >
                                  기본 박스(Glass Card) 사용
                                </label>
                              </div>
                              <div className="flex items-center gap-3 p-3 border rounded-xl bg-gray-50/50">
                                <input
                                  type="checkbox"
                                  id={`useWhiteBg_${layer.id}`}
                                  checked={layer.useWhiteBg || false}
                                  onChange={(e) =>
                                    updateLayer(
                                      layer.id,
                                      "useWhiteBg",
                                      e.target.checked,
                                    )
                                  }
                                  className="w-5 h-5 accent-brand-primary cursor-pointer"
                                />
                                <label
                                  htmlFor={`useWhiteBg_${layer.id}`}
                                  className="text-sm font-bold text-gray-700 cursor-pointer"
                                >
                                  배경색 화이트(bg-white) 적용
                                </label>
                              </div>
                            </div>
                            <div className="mb-4">
                              <label className="block text-sm font-bold text-gray-700 mb-1">
                                상단바 메뉴 연결 ID (Anchor ID)
                              </label>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400 font-bold">
                                  #
                                </span>
                                <input
                                  type="text"
                                  className="w-full border rounded-lg p-2.5 outline-none focus:ring-2"
                                  placeholder="layer1"
                                  value={layer.anchorId.replace("#", "")}
                                  onChange={(e) =>
                                    updateLayer(
                                      layer.id,
                                      "anchorId",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                * 상단바 메뉴의 링크에 `#입력값`을 넣으면 이
                                섹션으로 스크롤됩니다.
                              </p>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                              <Type className="w-5 h-5 text-brand-primary" />{" "}
                              텍스트 & 콘텐츠 설정
                            </h3>
                            <div className="space-y-4">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="block text-sm font-bold text-gray-700">
                                    메인 타이틀 (HTML 지원)
                                  </label>
                                  <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                                    <input
                                      type="checkbox"
                                      id={`showTitle_${layer.id}`}
                                      checked={layer.showTitle !== false}
                                      onChange={(e) =>
                                        updateLayer(
                                          layer.id,
                                          "showTitle",
                                          e.target.checked,
                                        )
                                      }
                                      className="w-3.5 h-3.5 accent-brand-primary cursor-pointer"
                                    />
                                    <label
                                      htmlFor={`showTitle_${layer.id}`}
                                      className={`text-[10px] font-bold cursor-pointer ${layer.showTitle === false ? "text-red-500" : "text-gray-500"}`}
                                    >
                                      {layer.showTitle === false ? "숨김" : "표시 중"}
                                    </label>
                                  </div>
                                </div>
                                <textarea
                                  className="w-full border rounded-lg p-2.5 h-20 outline-none focus:ring-2"
                                  value={layer.title}
                                  onChange={(e) =>
                                    updateLayer(
                                      layer.id,
                                      "title",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="block text-sm font-bold text-gray-700">
                                    서브 타이틀 (HTML 지원)
                                  </label>
                                  <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                                    <input
                                      type="checkbox"
                                      id={`showSubtitle_${layer.id}`}
                                      checked={layer.showSubtitle !== false}
                                      onChange={(e) =>
                                        updateLayer(
                                          layer.id,
                                          "showSubtitle",
                                          e.target.checked,
                                        )
                                      }
                                      className="w-3.5 h-3.5 accent-brand-primary cursor-pointer"
                                    />
                                    <label
                                      htmlFor={`showSubtitle_${layer.id}`}
                                      className={`text-[10px] font-bold cursor-pointer ${layer.showSubtitle === false ? "text-red-500" : "text-gray-500"}`}
                                    >
                                      {layer.showSubtitle === false ? "숨김" : "표시 중"}
                                    </label>
                                  </div>
                                </div>
                                <textarea
                                  className="w-full border rounded-lg p-2.5 h-20 outline-none focus:ring-2"
                                  value={layer.subtitle}
                                  onChange={(e) =>
                                    updateLayer(
                                      layer.id,
                                      "subtitle",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div className="flex items-center justify-between mb-4">
                                <label className="block text-sm font-bold text-gray-700">
                                  상세 콘텐츠 편집
                                </label>
                                <button
                                  onClick={() => setFullScreenLayerId(fullScreenLayerId === layer.id ? null : layer.id)}
                                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                                    fullScreenLayerId === layer.id
                                      ? "bg-gray-900 text-white hover:bg-black"
                                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                                  }`}
                                >
                                  {fullScreenLayerId === layer.id ? (
                                    <>
                                      <Minimize className="w-4 h-4" /> 전체화면 종료
                                    </>
                                  ) : (
                                    <>
                                      <Maximize className="w-4 h-4" /> 전체화면 편집
                                    </>
                                  )}
                                </button>
                              </div>

                              <div className={fullScreenLayerId === layer.id ? "fixed inset-0 z-[9999] bg-white overflow-y-auto flex flex-col" : ""}>
                                <div className={fullScreenLayerId === layer.id ? "flex-1 flex flex-col p-4 sm:p-10" : "space-y-6"}>
                                  {fullScreenLayerId === layer.id && (
                                    <div className="flex items-center justify-between border-b pb-4 mb-6">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                                          <Sparkles className="w-5 h-5 text-brand-primary" />
                                        </div>
                                        <div>
                                          <h2 className="text-xl font-black text-gray-900">전체 화면 편집 모드</h2>
                                          <p className="text-xs text-gray-400 font-medium">{layer.title || "제목 없음"} 레이어 편집 중</p>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => setFullScreenLayerId(null)}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-all"
                                      >
                                        <Minimize className="w-4 h-4" /> 종료하기 (ESC)
                                      </button>
                                    </div>
                                  )}

                                  <div className={fullScreenLayerId === layer.id ? "flex-1 flex flex-col gap-6" : "space-y-6"}>
                                    <RichTextEditor
                                      value={layer.contentHtml || ""}
                                      onChange={(val) =>
                                        updateLayer(layer.id, "contentHtml", val)
                                      }
                                      onGenerateAi={(prompt) =>
                                        handleGenerateAiContent(layer.id, prompt)
                                      }
                                      isGeneratingAi={isGeneratingAi}
                                      forcePreviewTrigger={refinementTriggers[layer.id]}
                                      isFullScreen={fullScreenLayerId === layer.id}
                                    />

                                    {layer.contentHtml && (
                                      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center justify-between mb-2">
                                          <label className="text-xs font-bold text-emerald-700 flex items-center gap-2">
                                            <Sparkles className="w-3 h-3" /> 생성된 콘텐츠 AI 정밀 수정
                                          </label>
                                          {layer.refinementHistory && layer.refinementHistory.length > 0 && (
                                            <button
                                              onClick={() => setHistoryModalOpenId(layer.id)}
                                              className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-emerald-200 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-all text-[10px] font-bold shadow-sm"
                                            >
                                              <History className="w-3 h-3" /> 수정 내역 관리
                                            </button>
                                          )}
                                        </div>
                                        <div className="flex gap-2">
                                          <input
                                            type="text"
                                            className="flex-1 border-emerald-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                            placeholder="예: '더 전문적인 말투로 바꿔줘', '문구를 더 짧게 줄여줘'"
                                            id={`refine-input-${layer.id}`}
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter") {
                                                handleRefineAiContent(layer.id, layer.contentHtml || "", e.currentTarget.value);
                                                e.currentTarget.value = "";
                                              }
                                            }}
                                          />
                                          <button
                                            onClick={() => {
                                              const input = document.getElementById(`refine-input-${layer.id}`) as HTMLInputElement;
                                              handleRefineAiContent(layer.id, layer.contentHtml || "", input.value);
                                              input.value = "";
                                            }}
                                            disabled={isGeneratingAi}
                                            className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50 flex items-center gap-2 shrink-0"
                                          >
                                            {isGeneratingAi ? (
                                              <Loader className="w-4 h-4 animate-spin" />
                                            ) : (
                                              <RefreshCw className="w-4 h-4" />
                                            )}
                                            수정하기
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-8">
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                <span className="font-bold text-sm text-gray-700 flex items-center gap-2">
                                  <MousePointerClick className="w-4 h-4 text-brand-primary" />{" "}
                                  버튼 추가/관리
                                </span>
                                <button
                                  onClick={() => addLayerButton(layer.id)}
                                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 py-1 px-2 border border-indigo-200 rounded sm:border-0 sm:p-0"
                                >
                                  <Plus className="w-3 h-3" /> 항목 추가
                                </button>
                              </div>

                              <div className="p-4 space-y-4">
                                {(!layer.buttons ||
                                  layer.buttons.length === 0) && (
                                  <p className="text-sm text-gray-400 text-center py-4">
                                    등록된 버튼이 없습니다.
                                  </p>
                                )}
                                {(layer.buttons || []).map((opt, i) => (
                                  <div
                                    key={i}
                                    className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200 relative"
                                  >
                                    <button
                                      onClick={() =>
                                        removeLayerButton(layer.id, i)
                                      }
                                      className="absolute top-3 right-3 text-gray-400 hover:text-red-500 rounded-lg"
                                      title="삭제"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>

                                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center pr-8 mb-2">
                                      <input
                                        type="text"
                                        value={opt.label}
                                        onChange={(e) =>
                                          updateLayerButton(layer.id, i, {
                                            label: e.target.value,
                                          })
                                        }
                                        placeholder="버튼 라벨 (예: 무료체험)"
                                        className="w-full sm:flex-1 px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm outline-none focus:border-indigo-500 min-w-[120px]"
                                      />

                                      <div className="flex gap-2 w-full sm:w-auto">
                                        <select
                                          value={opt.actionType || "section"}
                                          onChange={(e) =>
                                            updateLayerButton(layer.id, i, {
                                              actionType: e.target.value as any,
                                            })
                                          }
                                          className="px-2 py-2 border border-gray-300 bg-white rounded-lg text-sm outline-none focus:border-indigo-500"
                                        >
                                          <option value="section">
                                            # 타겟 이동 (섹션)
                                          </option>
                                          <option value="link">
                                            외부 링크 이동
                                          </option>
                                          <option value="modal">
                                            모달 띄우기
                                          </option>
                                        </select>
                                      </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
                                      {(!opt.actionType ||
                                        opt.actionType === "section") && (
                                        <>
                                          <Link className="w-4 h-4 text-gray-400 shrink-0 hidden sm:block" />
                                          <select
                                            value={opt.targetId || ""}
                                            onChange={(e) =>
                                              updateLayerButton(layer.id, i, {
                                                targetId:
                                                  e.target.value || null,
                                              })
                                            }
                                            className="w-full sm:flex-1 px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm outline-none focus:border-indigo-500"
                                          >
                                            <option value="">
                                              -- 이동할 섹션 선택 --
                                            </option>
                                            {(draft.sectionOrder || []).map(
                                              (sid) => {
                                                let n = sid;
                                                if (sid === "features")
                                                  n = "주요 기능";
                                                if (sid === "aiDemo")
                                                  n = "AI 헤어모델";
                                                if (sid === "pricing")
                                                  n = "요금제";
                                                if (sid.startsWith("layer_"))
                                                  n =
                                                    draft.layers?.find(
                                                      (l) => l.id === sid,
                                                    )?.name || "레이어";
                                                return (
                                                  <option key={sid} value={sid}>
                                                    {n}
                                                  </option>
                                                );
                                              },
                                            )}
                                          </select>
                                        </>
                                      )}
                                      {opt.actionType === "link" && (
                                        <>
                                          <Link className="w-4 h-4 text-gray-400 shrink-0 hidden sm:block" />
                                          <input
                                            type="text"
                                            value={opt.linkUrl || ""}
                                            onChange={(e) =>
                                              updateLayerButton(layer.id, i, {
                                                linkUrl: e.target.value,
                                              })
                                            }
                                            placeholder="https://..."
                                            className="w-full sm:flex-1 px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm outline-none focus:border-indigo-500"
                                          />
                                        </>
                                      )}
                                      {opt.actionType === "modal" && (
                                        <>
                                          <MousePointerClick className="w-4 h-4 text-gray-400 shrink-0 hidden sm:block" />
                                          <select
                                            value={opt.targetId || ""}
                                            onChange={(e) =>
                                              updateLayerButton(layer.id, i, {
                                                targetId:
                                                  e.target.value || null,
                                              })
                                            }
                                            className="w-full sm:flex-1 px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm outline-none focus:border-indigo-500"
                                          >
                                            <option value="">
                                              -- 띄울 모달 선택 --
                                            </option>
                                            <option value="auth">
                                              로그인 / 가입 Модал
                                            </option>
                                          </select>
                                        </>
                                      )}
                                      <div className="w-full sm:w-auto">
                                        <input
                                          type="text"
                                          value={opt.colorClass || ""}
                                          onChange={(e) =>
                                            updateLayerButton(layer.id, i, {
                                              colorClass: e.target.value,
                                            })
                                          }
                                          placeholder="Tailwind CSS 색상 (예: bg-indigo-600 text-white)"
                                          className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm outline-none focus:border-indigo-500"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                      </>
                  );
                })()}
              </div>
            )}

            {activeTab === "partners" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between mb-4 border-b pb-2">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-brand-primary" /> 파트너사 관리
                  </h3>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={draft.partnerSettings?.useWhiteBg !== false}
                        onChange={(e) => updatePartnerSettings("useWhiteBg", e.target.checked)}
                        className="w-4 h-4 accent-brand-primary"
                      />
                      <span className="text-sm font-medium text-gray-700">배경색 화이트(bg-white) 적용</span>
                    </label>
                    <button
                      onClick={addPartner}
                      className="flex items-center gap-2 text-sm text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 px-3 py-1.5 rounded-lg transition-colors font-bold"
                    >
                      <Plus className="w-4 h-4" /> 파트너사 추가
                    </button>
                  </div>
                </div>
                <p className="text-gray-500 mb-6 text-sm font-medium">
                  파트너사 모집 페이지 하단에 노출될 로고 배너 영역을 관리합니다. 드래그앤드롭으로 순서를 변경할 수 있습니다.
                </p>

                <div className="space-y-4">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handlePartnersDragEnd}
                  >
                    <SortableContext
                      items={(draft.partners || []).map((p) => p.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {(draft.partners || []).map((partner, idx) => (
                        <SortablePartnerCard
                          key={partner.id}
                          item={partner}
                          idx={idx}
                          onUpdate={updatePartnerField}
                          onDelete={deletePartner}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              </div>
            )}

            {activeTab === "parking" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-2">
                    <AlertTriangle className="w-5 h-5 text-brand-primary" /> 파킹 페이지 (공사중) 설정
                  </h3>
                  
                  <div className="flex items-center justify-between mb-8 p-5 bg-gray-50 rounded-xl border">
                    <div>
                      <h4 className="font-bold text-gray-900">파킹 페이지 활성화</h4>
                      <p className="text-sm text-gray-500 mt-1">활성화 시, 관리자를 제외한 모든 접속자에게 메인 화면 대신 파킹 페이지가 보여집니다.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={draft.parkingPage?.enabled ?? false}
                        onChange={(e) => setDraft({...draft, parkingPage: {...(draft.parkingPage || defaultSiteSettings.parkingPage!), enabled: e.target.checked}})}
                      />
                      <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-primary"></div>
                    </label>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">유형 선택</label>
                      <select
                        className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                        value={draft.parkingPage?.type || 'maintenance'}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          let title = draft.parkingPage?.title || '';
                          let subtitle = draft.parkingPage?.subtitle || '';
                          
                          if (val === 'maintenance') {
                            title = '시스템 점검 중입니다';
                            subtitle = '더 나은 서비스를 위해 사이트 점검을 진행하고 있습니다.\\n이용에 불편을 드려 죄송합니다.';
                          } else if (val === 'coming-soon') {
                            title = '오픈 준비 중입니다';
                            subtitle = '멋진 모습으로 곧 찾아뵙겠습니다.\\n조금만 기다려주세요!';
                          }
                          
                          setDraft({...draft, parkingPage: {
                            ...(draft.parkingPage || defaultSiteSettings.parkingPage!), 
                            type: val,
                            title,
                            subtitle
                          }});
                        }}
                      >
                        <option value="maintenance">시스템 점검중 (Maintenance)</option>
                        <option value="coming-soon">오픈 준비중 (Coming Soon)</option>
                        <option value="custom">사용자 정의</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">메인 제목</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand-primary"
                        value={draft.parkingPage?.title || ''}
                        onChange={(e) => setDraft({...draft, parkingPage: {...(draft.parkingPage || defaultSiteSettings.parkingPage!), title: e.target.value}})}
                        placeholder="예: 시스템 점검 중입니다"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">부제목 / 설명 (<br/> 줄바꿈 태그 사용 가능)</label>
                      <textarea
                        className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand-primary h-24"
                        value={draft.parkingPage?.subtitle || ''}
                        onChange={(e) => setDraft({...draft, parkingPage: {...(draft.parkingPage || defaultSiteSettings.parkingPage!), subtitle: e.target.value}})}
                        placeholder="상세 내용을 입력하세요."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">배경 색상</label>
                      <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border">
                        <input
                          type="color"
                          className="w-12 h-12 rounded cursor-pointer border-0 p-0"
                          value={draft.parkingPage?.bgColor || '#111827'}
                          onChange={(e) => setDraft({...draft, parkingPage: {...(draft.parkingPage || defaultSiteSettings.parkingPage!), bgColor: e.target.value}})}
                        />
                        <span className="font-mono text-sm font-bold text-gray-600">{draft.parkingPage?.bgColor || '#111827'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "popup" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm leading-relaxed">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Megaphone className="w-5 h-5 text-brand-primary" /> 이벤트 팝업 설정
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        사이트 진입 시 표시될 팝업을 관리합니다. 시작/종료일 및 위치를 지정할 수 있습니다.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const newPopup = {
                          id: `popup_${Date.now()}`,
                          enabled: false,
                          title: "새 이벤트 팝업",
                          contentHtml: "",
                          linkUrl: "",
                          linkText: "",
                          imageUrl: "",
                          startDate: "",
                          endDate: "",
                          positionX: 50,
                          positionY: 50
                        };
                        setDraft({
                          ...draft,
                          popups: [...(draft.popups || []), newPopup]
                        });
                      }}
                      className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" /> 팝업 추가
                    </button>
                  </div>

                  <div className="space-y-6">
                    {(draft.popups || []).length === 0 ? (
                      <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl">
                        등록된 팝업이 없습니다.
                      </div>
                    ) : (
                      (draft.popups || []).map((popup, idx) => (
                        <div key={popup.id} className="border border-gray-200 rounded-xl p-5 bg-gray-50 relative group">
                          <button
                            onClick={async () => {
                              const newPopups = [...draft.popups!];
                              const deletedPopup = newPopups.splice(idx, 1)[0];
                              if (deletedPopup?.imageUrl?.includes('supabase.co/storage/v1/object/public/models/popups/')) {
                                const oldFilePath = deletedPopup.imageUrl.split('models/')[1];
                                if (oldFilePath) {
                                  try {
                                    await supabase.storage.from('models').remove([oldFilePath]);
                                  } catch (e) {
                                    console.error('Failed to delete popup image', e);
                                  }
                                }
                              }
                              setDraft({ ...draft, popups: newPopups });
                            }}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg shadow-sm border border-gray-100"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 pr-12">
                            <span className="font-bold text-gray-700">팝업 #{idx + 1}</span>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <span className="text-sm font-bold text-gray-700">활성화 여부 :</span>
                              <div className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={popup.enabled}
                                  onChange={(e) => {
                                    const newPopups = [...draft.popups!];
                                    newPopups[idx] = { ...popup, enabled: e.target.checked };
                                    setDraft({ ...draft, popups: newPopups });
                                  }}
                                />
                                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                              </div>
                            </label>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1">게시 시작일시</label>
                              <input
                                type="datetime-local"
                                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                                value={popup.startDate || ''}
                                onChange={(e) => {
                                  const newPopups = [...draft.popups!];
                                  newPopups[idx] = { ...popup, startDate: e.target.value };
                                  setDraft({ ...draft, popups: newPopups });
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1">게시 종료일시</label>
                              <input
                                type="datetime-local"
                                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                                value={popup.endDate || ''}
                                onChange={(e) => {
                                  const newPopups = [...draft.popups!];
                                  newPopups[idx] = { ...popup, endDate: e.target.value };
                                  setDraft({ ...draft, popups: newPopups });
                                }}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1">화면 X 위치 (%)</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="range"
                                  min="0" max="100"
                                  className="w-full accent-brand-primary"
                                  value={popup.positionX ?? 50}
                                  onChange={(e) => {
                                    const newPopups = [...draft.popups!];
                                    newPopups[idx] = { ...popup, positionX: Number(e.target.value) };
                                    setDraft({ ...draft, popups: newPopups });
                                  }}
                                />
                                <span className="text-sm font-mono text-gray-500 w-12">{popup.positionX ?? 50}%</span>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1">화면 Y 위치 (%)</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="range"
                                  min="0" max="100"
                                  className="w-full accent-brand-primary"
                                  value={popup.positionY ?? 50}
                                  onChange={(e) => {
                                    const newPopups = [...draft.popups!];
                                    newPopups[idx] = { ...popup, positionY: Number(e.target.value) };
                                    setDraft({ ...draft, popups: newPopups });
                                  }}
                                />
                                <span className="text-sm font-mono text-gray-500 w-12">{popup.positionY ?? 50}%</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1">팝업 제목</label>
                              <input
                                type="text"
                                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                                value={popup.title || ''}
                                onChange={(e) => {
                                  const newPopups = [...draft.popups!];
                                  newPopups[idx] = { ...popup, title: e.target.value };
                                  setDraft({ ...draft, popups: newPopups });
                                }}
                                placeholder="예: 기간 한정 50% 할인 이벤트!"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1">팝업 내용</label>
                              <textarea
                                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand-primary h-24 bg-white"
                                value={popup.contentHtml || ''}
                                onChange={(e) => {
                                  const newPopups = [...draft.popups!];
                                  newPopups[idx] = { ...popup, contentHtml: e.target.value };
                                  setDraft({ ...draft, popups: newPopups });
                                }}
                                placeholder="이벤트 상세 내용을 입력하세요."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1">이미지 URL (선택)</label>
                              <div className="flex gap-2 relative">
                                <input
                                  type="text"
                                  className="flex-1 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                                  value={popup.imageUrl || ''}
                                  onChange={(e) => {
                                    const newPopups = [...draft.popups!];
                                    newPopups[idx] = { ...popup, imageUrl: e.target.value };
                                    setDraft({ ...draft, popups: newPopups });
                                  }}
                                  placeholder="https://..."
                                />
                                <label className={`cursor-pointer px-4 py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center gap-2 whitespace-nowrap transition-colors ${isUploadingPopupImage[popup.id] ? 'opacity-50 pointer-events-none' : ''}`}>
                                  {isUploadingPopupImage[popup.id] ? <Loader className="w-4 h-4 animate-spin" /> : <Icons.Upload className="w-4 h-4" />}
                                  <span className="text-sm font-bold text-gray-700">업로드</span>
                                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePopupImageUpload(e, idx)} disabled={isUploadingPopupImage[popup.id]} />
                                </label>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">버튼 텍스트</label>
                                <input
                                  type="text"
                                  className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                                  value={popup.linkText || ''}
                                  onChange={(e) => {
                                    const newPopups = [...draft.popups!];
                                    newPopups[idx] = { ...popup, linkText: e.target.value };
                                    setDraft({ ...draft, popups: newPopups });
                                  }}
                                  placeholder="이벤트 보러가기"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">버튼 연결 링크</label>
                                <input
                                  type="text"
                                  className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                                  value={popup.linkUrl || ''}
                                  onChange={(e) => {
                                    const newPopups = [...draft.popups!];
                                    newPopups[idx] = { ...popup, linkUrl: e.target.value };
                                    setDraft({ ...draft, popups: newPopups });
                                  }}
                                  placeholder="/events 또는 https://..."
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "event_posts" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm leading-relaxed">
                  <div className="flex items-center justify-between mb-6 border-b pb-2">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <List className="w-5 h-5 text-brand-primary" /> 이벤트 게시글 관리
                    </h3>
                    <button
                      onClick={() => {
                        const newPost = {
                          id: `event_${Date.now()}`,
                          title: "새 이벤트",
                          contentHtml: "",
                          imageUrl: "",
                          isPublished: false,
                          createdAt: new Date().toISOString()
                        };
                        setDraft({
                          ...draft,
                          eventPosts: [newPost, ...(draft.eventPosts || [])]
                        });
                      }}
                      className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-bold flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> 새 게시글 추가
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(draft.eventPosts || []).length === 0 ? (
                      <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl">
                        등록된 이벤트 게시글이 없습니다.
                      </div>
                    ) : (
                      (draft.eventPosts || []).map((post, idx) => (
                        <div key={post.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50 relative group">
                          <button
                            onClick={async () => {
                              const newPosts = [...draft.eventPosts!];
                              const deletedPost = newPosts.splice(idx, 1)[0];
                              if (deletedPost?.imageUrl?.includes('supabase.co/storage/v1/object/public/models/events/')) {
                                const oldFilePath = deletedPost.imageUrl.split('models/')[1];
                                if (oldFilePath) {
                                  try {
                                    await supabase.storage.from('models').remove([oldFilePath]);
                                  } catch (e) {
                                    console.error('Failed to delete image', e);
                                  }
                                }
                              }
                              setDraft({ ...draft, eventPosts: newPosts });
                            }}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg shadow-sm"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1">게시글 제목</label>
                              <input
                                type="text"
                                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                                value={post.title}
                                onChange={(e) => {
                                  const newPosts = [...draft.eventPosts!];
                                  newPosts[idx] = { ...newPosts[idx], title: e.target.value };
                                  setDraft({ ...draft, eventPosts: newPosts });
                                }}
                              />
                            </div>
                            <div className="flex items-end pb-3">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={post.isPublished}
                                  onChange={(e) => {
                                    const newPosts = [...draft.eventPosts!];
                                    newPosts[idx] = { ...newPosts[idx], isPublished: e.target.checked };
                                    setDraft({ ...draft, eventPosts: newPosts });
                                  }}
                                  className="w-4 h-4 text-brand-primary rounded"
                                />
                                <span className="text-sm font-bold text-gray-700">발행 여부 (체크 시 목록에 노출)</span>
                              </label>
                            </div>
                          </div>

                          <div className="mb-4">
                            <label className="block text-sm font-bold text-gray-700 mb-1">상단 배너 이미지 URL (선택)</label>
                            <div className="flex gap-2 relative">
                              <input
                                type="text"
                                className="flex-1 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand-primary bg-white"
                                value={post.imageUrl || ''}
                                onChange={(e) => {
                                  const newPosts = [...draft.eventPosts!];
                                  newPosts[idx] = { ...newPosts[idx], imageUrl: e.target.value };
                                  setDraft({ ...draft, eventPosts: newPosts });
                                }}
                                placeholder="https://..."
                              />
                              <label className={`cursor-pointer px-4 py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center gap-2 whitespace-nowrap transition-colors ${isUploadingEventBanner[post.id] ? 'opacity-50 pointer-events-none' : ''}`}>
                                {isUploadingEventBanner[post.id] ? <Loader className="w-4 h-4 animate-spin" /> : <Icons.Upload className="w-4 h-4" />}
                                <span className="text-sm font-bold text-gray-700">업로드</span>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleEventBannerUpload(e, idx)} disabled={isUploadingEventBanner[post.id]} />
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">상세 내용 (HTML 지원)</label>
                            <textarea
                              className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand-primary bg-white min-h-[120px]"
                              value={post.contentHtml}
                              onChange={(e) => {
                                const newPosts = [...draft.eventPosts!];
                                newPosts[idx] = { ...newPosts[idx], contentHtml: e.target.value };
                                setDraft({ ...draft, eventPosts: newPosts });
                              }}
                              placeholder="내용을 입력하세요..."
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "seo" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                    <Search className="w-5 h-5 text-brand-primary" /> 검색 포털 (Google, Naver) 개방 및 메타 태그
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        사이트 제목 (Title)
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none"
                        value={draft.seoSettings?.title || ""}
                        onChange={(e) => updateSeoSettings("title", e.target.value)}
                        placeholder="예: Hairdeal - 최고급 미용 마케팅 플랫폼"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        사이트 설명 (Description)
                      </label>
                      <textarea
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none h-24 resize-none"
                        value={draft.seoSettings?.description || ""}
                        onChange={(e) => updateSeoSettings("description", e.target.value)}
                        placeholder="검색 결과에서 제목 아래에 표시될 문구입니다."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        검색 키워드 (Keywords)
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none"
                        value={draft.seoSettings?.keywords || ""}
                        onChange={(e) => updateSeoSettings("keywords", e.target.value)}
                        placeholder="헤어디자이너, 미용실, 콤마로 구분하여 입력하세요."
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-brand-primary" /> 소셜 공유 이미지 (Open Graph)
                  </h3>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      공유용 이미지 (og:image) URL
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none mb-3"
                      value={draft.seoSettings?.ogImage || ""}
                      onChange={(e) => updateSeoSettings("ogImage", e.target.value)}
                    />
                    {draft.seoSettings?.ogImage && (
                      <div className="w-full md:w-1/2 aspect-video bg-gray-100 rounded-xl border overflow-hidden">
                        <img src={draft.seoSettings.ogImage} alt="OG Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-brand-primary/5 rounded-2xl p-6 border border-brand-primary/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Bot className="w-5 h-5 text-brand-primary" /> AI 자동 SEO 최적화 (Data-driven Automation) 
                    </h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        value=""
                        className="sr-only peer"
                        checked={draft.seoSettings?.aiAutoEnabled || false}
                        onChange={(e) => updateSeoSettings("aiAutoEnabled", e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                    </label>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-6">
                    AI가 설정된 주기에 맞춰 구글, 네이버 등 주요 포털의 키워드 통계를 분석하고,
                    타겟에 맞게 메타 정보를 가장 높은 위치로 노출되도록 자동으로 업데이트합니다.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        타겟 고객 및 핵심 주제 태그 (Enter로 구분)
                      </label>
                      <textarea
                        className="w-full px-4 py-2 border border-brand-primary/30 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none min-h-[80px]"
                        placeholder="예: 헤어디자이너 인플루언서 마케팅, 미용실 고객 유치, 최신 헤어스타일, CRM"
                        value={draft.seoSettings?.targetKeywords?.join('\n') || ""}
                        onChange={(e) => updateSeoSettings("targetKeywords", e.target.value.split('\n').filter(Boolean))}
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="block text-sm font-bold text-gray-700 w-24">
                        분석/업데이트 주기
                      </label>
                      <select 
                        className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-brand-primary"
                        value={draft.seoSettings?.aiUpdateInterval || "weekly"}
                        onChange={(e) => updateSeoSettings("aiUpdateInterval", e.target.value)}
                      >
                        <option value="daily">매일 (Daily)</option>
                        <option value="weekly">매주 (Weekly)</option>
                        <option value="monthly">매월 (Monthly)</option>
                      </select>
                    </div>

                    <div className="mt-4 pt-4 border-t border-brand-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {draft.seoSettings?.lastAnalyzedAt ? (
                        <div className="text-xs text-gray-500 font-medium whitespace-nowrap">
                          마지막 AI 분석 및 반영: {new Date(draft.seoSettings.lastAnalyzedAt).toLocaleString()}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 font-medium whitespace-nowrap">
                          아직 분석된 기록이 없습니다.
                        </div>
                      )}
                      
                      <button 
                        onClick={() => {
                           alert('현재 통계 데이터를 불러와서 AI 분석을 시작합니다. (Simulation)');
                           updateSeoSettings('lastAnalyzedAt', new Date().toISOString());
                        }}
                        className="bg-brand-primary text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-brand-primary/90 transition-colors whitespace-nowrap"
                      >
                        <Sparkles className="w-4 h-4" /> 지금 바로 AI 최적화 실행
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === "promo" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-brand-primary/5 rounded-2xl p-6 border border-brand-primary/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Megaphone className="w-5 h-5 text-brand-primary" /> AI 자동 홍보 시스템 (마케팅 자동화)
                    </h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={draft.promoSettings?.enabled || false}
                        onChange={(e) => updatePromoSettings("enabled", e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                    </label>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-6">
                    지정된 대상(인스타그램, 네이버 카페 등)에 맞춰 헤어디자이너를 타겟으로 하는 자동 홍보 게시글을 생성하고 스케줄링합니다.
                  </p>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">홍보 플랫폼 선택</label>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { id: 'instagram', label: '인스타그램' },
                          { id: 'naver_cafe', label: '네이버카페/블로그' },
                          { id: 'kakaotalk', label: '오픈채팅' }
                        ].map(platform => (
                          <label key={platform.id} className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border cursor-pointer hover:bg-gray-50 transition-colors">
                            <input 
                              type="checkbox" 
                              checked={draft.promoSettings?.platforms?.includes(platform.id) || false}
                              onChange={(e) => {
                                const current = draft.promoSettings?.platforms || [];
                                const newPlatforms = e.target.checked 
                                  ? [...current, platform.id]
                                  : current.filter(p => p !== platform.id);
                                updatePromoSettings("platforms", newPlatforms);
                              }}
                              className="w-4 h-4 accent-brand-primary"
                            />
                            <span className="text-sm font-medium text-gray-700">{platform.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">생성 및 배포 주기</label>
                        <select 
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl outline-none focus:border-brand-primary"
                          value={draft.promoSettings?.frequency || "weekly"}
                          onChange={(e) => updatePromoSettings("frequency", e.target.value)}
                        >
                          <option value="daily">매일 1회</option>
                          <option value="weekly">매주 3회 (월/수/금)</option>
                          <option value="custom">사용자 지정</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">어조 및 분위기 (Tone)</label>
                        <select 
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl outline-none focus:border-brand-primary"
                          value={draft.promoSettings?.tone || "professional"}
                          onChange={(e) => updatePromoSettings("tone", e.target.value)}
                        >
                          <option value="professional">전문적인 / 신뢰감 있는</option>
                          <option value="friendly">친근한 / 소통하는</option>
                          <option value="trendy">트렌디한 / 감각적인</option>
                          <option value="informative">정보 제공형 / 교육적인</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">주력 홍보 내용 (메인 어필 포인트)</label>
                      <textarea
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none min-h-[100px] resize-none"
                        value={draft.promoSettings?.mainPromoContent || ""}
                        onChange={(e) => updatePromoSettings("mainPromoContent", e.target.value)}
                        placeholder="예: 14일 무료 체험 기간 제공, 월 9,900원의 저렴한 비용으로 시작하는 AI 솔루션, 100% 자동화된 예약 시스템"
                      />
                      <p className="mt-1 text-xs text-gray-500">AI가 이 내용을 기반으로 매번 새로운 형태의 게시글을 자동으로 작성합니다.</p>
                    </div>

                    <div className="border-t border-brand-primary/20 pt-6">
                      <label className="block text-sm font-bold text-gray-700 mb-4">자동 포스팅 계정 연동 (선택사항)</label>
                      <div className="space-y-3">
                        <div className="bg-white p-4 rounded-xl border flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 flex items-center justify-center text-white">
                              <Icons.Instagram className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">Instagram 비즈니스 계정</p>
                              <p className="text-xs text-gray-500">{draft.promoSettings?.credentials?.instagram?.connected ? `연결됨: ${draft.promoSettings.credentials.instagram.username}` : '미연결'}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              if (!draft.promoSettings?.credentials?.instagram?.connected) {
                                handleOAuthConnect('instagram');
                              } else {
                                updatePromoSettings("credentials", {
                                  ...draft.promoSettings?.credentials,
                                  instagram: { connected: false }
                                });
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${draft.promoSettings?.credentials?.instagram?.connected ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                          >
                            {draft.promoSettings?.credentials?.instagram?.connected ? '연결 해제' : '계정 연결'}
                          </button>
                        </div>

                        <div className="bg-white p-4 rounded-xl border flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#03C75A] flex items-center justify-center text-white">
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.96 11.45V4.54H8.71L5.05 8.79V4.54H3.04V11.45H5.29L8.95 7.2V11.45H10.96Z" fill="white"/>
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">네이버 (블로그/카페)</p>
                              <p className="text-xs text-gray-500">{draft.promoSettings?.credentials?.naver?.connected ? `연결됨: ${draft.promoSettings.credentials.naver.username}` : '미연결'}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              if (!draft.promoSettings?.credentials?.naver?.connected) {
                                handleOAuthConnect('naver');
                              } else {
                                updatePromoSettings("credentials", {
                                  ...draft.promoSettings?.credentials,
                                  naver: { connected: false }
                                });
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${draft.promoSettings?.credentials?.naver?.connected ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-[#03C75A]/10 text-[#03C75A] hover:bg-[#03C75A]/20'}`}
                          >
                            {draft.promoSettings?.credentials?.naver?.connected ? '연결 해제' : '계정 연결'}
                          </button>
                        </div>

                        <div className="bg-white p-4 rounded-xl border flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#FEE500] flex items-center justify-center text-[#191919]">
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 3.5C4.41015 3.5 1.5 5.85025 1.5 8.75C1.5 10.6385 2.7667 12.2855 4.67385 13.167L4.03265 15.5398C3.99225 15.6893 4.15045 15.8118 4.28185 15.727L7.0988 13.8213C7.39345 13.8617 7.69315 13.882 8 13.882C11.5899 13.882 14.5 11.5317 14.5 8.632C14.5 5.7323 11.5899 3.5 8 3.5Z" fill="#000000"/>
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">카카오톡 (오픈채팅/플러스친구)</p>
                              <p className="text-xs text-gray-500">{draft.promoSettings?.credentials?.kakao?.connected ? `연결됨: ${draft.promoSettings.credentials.kakao.username}` : '미연결'}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              if (!draft.promoSettings?.credentials?.kakao?.connected) {
                                handleOAuthConnect('kakao');
                              } else {
                                updatePromoSettings("credentials", {
                                  ...draft.promoSettings?.credentials,
                                  kakao: { connected: false }
                                });
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${draft.promoSettings?.credentials?.kakao?.connected ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-[#FEE500]/20 text-[#191919] hover:bg-[#FEE500]/40'}`}
                          >
                            {draft.promoSettings?.credentials?.kakao?.connected ? '연결 해제' : '계정 연결'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-brand-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {draft.promoSettings?.lastPostedAt ? (
                        <div className="text-xs text-gray-500 font-medium">
                          최근 홍보 포스팅: {new Date(draft.promoSettings.lastPostedAt).toLocaleString()}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 font-medium">
                          아직 봇이 실행되지 않았습니다. 예약이 활성화되면 AI가 콘텐츠를 생성합니다.
                        </div>
                      )}
                      
                      <button 
                        onClick={generateSamplePromo}
                        disabled={isGeneratingPromo}
                        className="bg-brand-primary text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
                      >
                        {isGeneratingPromo ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                        {isGeneratingPromo ? '생성 중...' : 'AI 홍보 샘플 생성 테스트'}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* AI Promo History Viewer */}
                <div className="bg-white rounded-2xl p-6 border shadow-sm mt-8 border-brand-primary/20">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Icons.History className="w-5 h-5 text-brand-primary" /> AI 자동 홍보 생성 히스토리
                    </h3>
                    
                    <div className="flex items-center gap-2">
                      <input 
                        type="date"
                        className="border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-primary"
                        value={promoHistoryFilter.start}
                        onChange={e => setPromoHistoryFilter(prev => ({ ...prev, start: e.target.value }))}
                      />
                      <span className="text-gray-400">~</span>
                      <input 
                        type="date"
                        className="border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-primary"
                        value={promoHistoryFilter.end}
                        onChange={e => setPromoHistoryFilter(prev => ({ ...prev, end: e.target.value }))}
                      />
                      {(promoHistoryFilter.start || promoHistoryFilter.end) && (
                        <button 
                          onClick={() => setPromoHistoryFilter({ start: '', end: '' })}
                          className="text-xs text-gray-500 hover:text-gray-700 underline ml-2"
                        >초기화</button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {(!draft.promoSettings?.history || draft.promoSettings.history.length === 0) ? (
                      <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-xl border border-dashed">
                        아직 생성된 홍보 히스토리가 없습니다.
                      </div>
                    ) : (
                      draft.promoSettings.history
                        .filter(item => {
                          if (!promoHistoryFilter.start && !promoHistoryFilter.end) return true;
                          const itemDate = new Date(item.createdAt).getTime();
                          const startDate = promoHistoryFilter.start ? new Date(promoHistoryFilter.start).getTime() : 0;
                          const endDate = promoHistoryFilter.end ? new Date(promoHistoryFilter.end + 'T23:59:59').getTime() : Infinity;
                          return itemDate >= startDate && itemDate <= endDate;
                        })
                        .map(item => (
                          <div key={item.id} className="border border-gray-100 rounded-xl p-4 hover:border-brand-primary/30 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-900">
                                  {new Date(item.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                {Object.entries(item.status || {}).map(([platform, status]) => (
                                  <div 
                                    key={platform} 
                                    className="flex items-center gap-1.5 bg-gray-50 border px-2 py-1 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => {
                                      const text = item.platformContents?.[platform];
                                      if (text) {
                                        navigator.clipboard.writeText(text);
                                        alert(`${platform} 홍보글이 복사되었습니다.`);
                                      } else {
                                        alert('해당 플랫폼의 내용이 없습니다.');
                                      }
                                    }}
                                    title={`${platform} 텍스트 복사하기`}
                                  >
                                    <span className="text-xs font-bold text-gray-600 uppercase flex items-center gap-1">
                                      {platform === 'instagram' ? (
                                        <div className="w-4 h-4 rounded bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 flex items-center justify-center text-white">
                                          <Icons.Instagram className="w-3 h-3" />
                                        </div>
                                      ) : platform === 'naver_cafe' || platform === 'naver_blog' ? (
                                        <div className="w-4 h-4 rounded bg-[#03C75A] flex items-center justify-center text-white">
                                          <svg width="8" height="8" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M10.96 11.45V4.54H8.71L5.05 8.79V4.54H3.04V11.45H5.29L8.95 7.2V11.45H10.96Z" fill="white"/>
                                          </svg>
                                        </div>
                                      ) : (
                                        <div className="w-4 h-4 rounded bg-[#FEE500] flex items-center justify-center text-[#191919]">
                                          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M8 3.5C4.41015 3.5 1.5 5.85025 1.5 8.75C1.5 10.6385 2.7667 12.2855 4.67385 13.167L4.03265 15.5398C3.99225 15.6893 4.15045 15.8118 4.28185 15.727L7.0988 13.8213C7.39345 13.8617 7.69315 13.882 8 13.882C11.5899 13.882 14.5 11.5317 14.5 8.632C14.5 5.7323 11.5899 3.5 8 3.5Z" fill="#000000"/>
                                          </svg>
                                        </div>
                                      )}
                                    </span>
                                    {status === 'success' && <Icons.CheckCircle2 className="w-4 h-4 text-green-500" title="성공" />}
                                    {status === 'failed' && <Icons.XCircle className="w-4 h-4 text-red-500" title="실패" />}
                                    {status === 'pending' && <Icons.Clock className="w-4 h-4 text-yellow-500" title="대기중" />}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="text-sm bg-gray-50 p-3 rounded-lg text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                              {item.content}
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>

              </div>
            )}

            {activeTab === "credit_settings" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <div className="flex items-center justify-between mb-4 border-b pb-2">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-brand-primary" /> 크레딧 충전 설정
                    </h3>
                  </div>
                  <div className="space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">크레딧 충전 영역 표시</h4>
                        <p className="text-sm text-gray-500">마이페이지의 [크레딧 관리]에서 충전 옵션 영역을 표시하거나 숨깁니다.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={draft.creditSettings?.chargeOptionsEnabled || false}
                          onChange={(e) => {
                            setDraft(prev => ({
                              ...prev,
                              creditSettings: {
                                ...prev.creditSettings,
                                chargeOptionsEnabled: e.target.checked
                              }
                            }));
                          }}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "footer" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-brand-primary" /> 서비스
                    소개 & 로고
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        로고 타입
                      </label>
                      <select
                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-brand-primary outline-none"
                        value={draft.footer.logoType}
                        onChange={(e) =>
                          updateFooter("logoType", e.target.value)
                        }
                      >
                        <option value="text">텍스트 (Text)</option>
                        <option value="image">이미지 (Image)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        로고 내용 (Text or URL)
                      </label>
                      {draft.footer.logoType === "text" ? (
                        <input
                          type="text"
                          className="w-full border rounded-lg p-2.5 outline-none focus:ring-2"
                          value={draft.footer.logoText}
                          onChange={(e) =>
                            updateFooter("logoText", e.target.value)
                          }
                        />
                      ) : (
                        <input
                          type="text"
                          className="w-full border rounded-lg p-2.5 outline-none focus:ring-2"
                          placeholder="https://..."
                          value={draft.footer.logoImage}
                          onChange={(e) =>
                            updateFooter("logoImage", e.target.value)
                          }
                        />
                      )}
                    </div>
                  </div>
                  {draft.footer.logoType === "image" && (
                    <div className="grid grid-cols-2 gap-4 mt-4 mb-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          로고 가로 크기 (Width)
                        </label>
                        <input
                          type="text"
                          className="w-full border rounded-lg p-2.5 outline-none focus:ring-2"
                          placeholder="auto 또는 120px"
                          value={draft.footer.logoWidth}
                          onChange={(e) =>
                            updateFooter("logoWidth", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          로고 세로 크기 (Height)
                        </label>
                        <input
                          type="text"
                          className="w-full border rounded-lg p-2.5 outline-none focus:ring-2"
                          placeholder="32px 또는 100%"
                          value={draft.footer.logoHeight}
                          onChange={(e) =>
                            updateFooter("logoHeight", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      서비스 간략 설명
                    </label>
                    <textarea
                      className="w-full border rounded-lg p-2.5 h-24 outline-none focus:ring-2"
                      value={draft.footer.subtitle}
                      onChange={(e) => updateFooter("subtitle", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                    <Layout className="w-5 h-5 text-brand-primary" /> 소셜 &
                    외부 링크 관리
                  </h3>
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-xl border">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-sm">소셜 미디어 (SNS)</h4>
                        <button
                          onClick={() => addFooterLink("social")}
                          className="text-xs font-bold text-brand-primary flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> 추가
                        </button>
                      </div>
                      <div className="space-y-3">
                        {draft.footer.social.map((s, idx) => (
                          <div
                            key={s.id}
                            className="flex gap-2 items-center bg-white p-2 rounded-lg border"
                          >
                            <select
                              className="border rounded p-1 text-xs outline-none"
                              value={s.platform}
                              onChange={(e) =>
                                updateFooterLink(
                                  "social",
                                  idx,
                                  "platform",
                                  e.target.value,
                                )
                              }
                            >
                              <option value="Instagram">Instagram</option>
                              <option value="Youtube">Youtube</option>
                              <option value="Facebook">Facebook</option>
                              <option value="Twitter">Twitter</option>
                            </select>
                            <input
                              type="text"
                              className="flex-1 border rounded p-1 text-xs outline-none"
                              placeholder="https://..."
                              value={s.link}
                              onChange={(e) =>
                                updateFooterLink(
                                  "social",
                                  idx,
                                  "link",
                                  e.target.value,
                                )
                              }
                            />
                            <button
                              onClick={() => deleteFooterLink("social", idx)}
                              className="p-1 text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-xl border">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-sm">회사 관련 링크</h4>
                          <button
                            onClick={() => addFooterLink("company")}
                            className="text-xs font-bold text-brand-primary flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> 추가
                          </button>
                        </div>
                        <div className="space-y-2">
                          {draft.footer.companyLinks.map((l, idx) => (
                            <div
                              key={l.id}
                              className="flex gap-2 bg-white p-2 rounded-lg border"
                            >
                              <input
                                type="text"
                                className="w-24 border rounded p-1 text-xs outline-none"
                                placeholder="이름"
                                value={l.label}
                                onChange={(e) =>
                                  updateFooterLink(
                                    "company",
                                    idx,
                                    "label",
                                    e.target.value,
                                  )
                                }
                              />
                              <input
                                type="text"
                                className="flex-1 border rounded p-1 text-xs outline-none"
                                placeholder="URL"
                                value={l.link}
                                onChange={(e) =>
                                  updateFooterLink(
                                    "company",
                                    idx,
                                    "link",
                                    e.target.value,
                                  )
                                }
                              />
                              <button
                                onClick={() => deleteFooterLink("company", idx)}
                                className="p-1 text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-sm">
                            서비스 관련 링크
                          </h4>
                          <button
                            onClick={() => addFooterLink("service")}
                            className="text-xs font-bold text-brand-primary flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> 추가
                          </button>
                        </div>
                        <div className="space-y-2">
                          {draft.footer.serviceLinks.map((l, idx) => (
                            <div
                              key={l.id}
                              className="flex gap-2 bg-white p-2 rounded-lg border"
                            >
                              <input
                                type="text"
                                className="w-24 border rounded p-1 text-xs outline-none"
                                placeholder="이름"
                                value={l.label}
                                onChange={(e) =>
                                  updateFooterLink(
                                    "service",
                                    idx,
                                    "label",
                                    e.target.value,
                                  )
                                }
                              />
                              <input
                                type="text"
                                className="flex-1 border rounded p-1 text-xs outline-none"
                                placeholder="URL"
                                value={l.link}
                                onChange={(e) =>
                                  updateFooterLink(
                                    "service",
                                    idx,
                                    "link",
                                    e.target.value,
                                  )
                                }
                              />
                              <button
                                onClick={() => deleteFooterLink("service", idx)}
                                className="p-1 text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-brand-primary" /> 연락처 정보
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-bold text-gray-700">
                          이메일
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="rounded text-brand-primary"
                            checked={draft.footer.contact.showEmail !== false}
                            onChange={(e) => updateFooterContact("showEmail", e.target.checked)}
                          /> 표시
                        </label>
                      </div>
                      <input
                        type="text"
                        className="w-full border rounded-lg p-2.5 outline-none focus:ring-2"
                        value={draft.footer.contact.email}
                        onChange={(e) =>
                          updateFooterContact("email", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-bold text-gray-700">
                          전화번호
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="rounded text-brand-primary"
                            checked={draft.footer.contact.showPhone !== false}
                            onChange={(e) => updateFooterContact("showPhone", e.target.checked)}
                          /> 표시
                        </label>
                      </div>
                      <input
                        type="text"
                        className="w-full border rounded-lg p-2.5 outline-none focus:ring-2"
                        value={draft.footer.contact.phone}
                        onChange={(e) =>
                          updateFooterContact("phone", e.target.value)
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-bold text-gray-700">
                          주소
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="rounded text-brand-primary"
                            checked={draft.footer.contact.showAddress !== false}
                            onChange={(e) => updateFooterContact("showAddress", e.target.checked)}
                          /> 표시
                        </label>
                      </div>
                      <input
                        type="text"
                        className="w-full border rounded-lg p-2.5 outline-none focus:ring-2"
                        value={draft.footer.contact.address}
                        onChange={(e) =>
                          updateFooterContact("address", e.target.value)
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-bold text-gray-700">
                          운영시간 (예: 평일 10:00~18:00)
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="rounded text-brand-primary"
                            checked={draft.footer.contact.showWorkingHours !== false}
                            onChange={(e) => updateFooterContact("showWorkingHours", e.target.checked)}
                          /> 표시
                        </label>
                      </div>
                      <input
                        type="text"
                        className="w-full border rounded-lg p-2.5 outline-none focus:ring-2"
                        value={draft.footer.contact.workingHours}
                        onChange={(e) =>
                          updateFooterContact("workingHours", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                    <Layout className="w-5 h-5 text-brand-primary" /> 약관 및
                    하단 문구 관리
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        서비스 이용약관
                      </label>
                      <textarea
                        className="w-full border rounded-lg p-2.5 h-32 outline-none focus:ring-2"
                        value={draft.footer.policies.terms}
                        onChange={(e) =>
                          updateFooterPolicy("terms", e.target.value)
                        }
                      />
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          placeholder="서비스 이용약관 생성을 위한 프롬프트를 입력하세요 (예: 미용실 예약관리 서비스)"
                          className="flex-1 border rounded-lg p-2 text-sm outline-none focus:ring-2"
                          value={termsPrompt}
                          onChange={(e) => setTermsPrompt(e.target.value)}
                        />
                        <button
                          onClick={handleGenerateTerms}
                          disabled={isGeneratingTerms}
                          className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-primary/90 flex flex-shrink-0 items-center justify-center gap-1 min-w-[120px]"
                        >
                          {isGeneratingTerms ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> 생성 중...</>
                          ) : (
                            <><Sparkles className="w-4 h-4" /> AI 자동생성</>
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        개인정보처리방침
                      </label>
                      <textarea
                        className="w-full border rounded-lg p-2.5 h-32 outline-none focus:ring-2"
                        value={draft.footer.policies.privacy}
                        onChange={(e) =>
                          updateFooterPolicy("privacy", e.target.value)
                        }
                      />
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          placeholder="개인정보처리방침 생성을 위한 프롬프트를 입력하세요 (예: 수집항목 - 이름, 전화번호)"
                          className="flex-1 border rounded-lg p-2 text-sm outline-none focus:ring-2"
                          value={privacyPrompt}
                          onChange={(e) => setPrivacyPrompt(e.target.value)}
                        />
                        <button
                          onClick={handleGeneratePrivacy}
                          disabled={isGeneratingPrivacy}
                          className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-primary/90 flex flex-shrink-0 items-center justify-center gap-1 min-w-[120px]"
                        >
                          {isGeneratingPrivacy ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> 생성 중...</>
                          ) : (
                            <><Sparkles className="w-4 h-4" /> AI 자동생성</>
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        카피라이트 (Copyright)
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded-lg p-2.5 outline-none focus:ring-2"
                        value={draft.footer.copyright}
                        onChange={(e) =>
                          updateFooter("copyright", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "pricing" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <div className="flex items-center justify-between mb-4 border-b pb-2">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-brand-primary" /> 요금제
                      공통 설정
                    </h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={draft.pricing?.useWhiteBg || false}
                        onChange={(e) => updatePricing("useWhiteBg", e.target.checked)}
                        className="w-4 h-4 accent-brand-primary"
                      />
                      <span className="text-sm font-medium text-gray-700">배경색 화이트(bg-white) 적용</span>
                    </label>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        요금제 섹션 제목
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded-lg p-2.5 outline-none focus:ring-2"
                        value={draft.pricing.title}
                        onChange={(e) => updatePricing("title", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        요금제 섹션 설명 (HTML 지원)
                      </label>
                      <textarea
                        className="w-full border rounded-lg p-2.5 h-16 outline-none focus:ring-2"
                        value={draft.pricing.subtitle}
                        onChange={(e) =>
                          updatePricing("subtitle", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        공통 연결제 할인율 (%)
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            className="w-32 border rounded-lg p-2.5 outline-none focus:ring-2"
                            value={draft.pricing.yearlyDiscountRate}
                            onChange={(e) =>
                              updatePricing(
                                "yearlyDiscountRate",
                                Number(e.target.value),
                              )
                            }
                          />
                          <span className="font-bold text-gray-500">
                            %할인 표기
                          </span>
                        </div>
                        <div className="flex items-center gap-2 border-l pl-4 border-gray-200">
                          <span className="font-bold text-gray-700 text-sm">연간 결제 적용</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={draft.pricing.yearlyBillingEnabled ?? true}
                              onChange={(e) => updatePricing("yearlyBillingEnabled", e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="flex items-center justify-between mb-4 border-b pb-2">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Layout className="w-5 h-5 text-brand-primary" /> 플랜
                      (Plans) 설정
                    </h3>
                    <button
                      onClick={addPricingPlan}
                      className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-bold hover:bg-brand-primary/90 transition-all shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> 요금제 추가
                    </button>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {draft.pricing.plans.map((plan, pIdx) => (
                      <div
                        key={plan.id}
                        className={`p-5 rounded-xl border flex flex-col ${plan.hidden ? "bg-gray-50 opacity-60" : "bg-white shadow-md border-gray-200"}`}
                      >
                        <div className="flex items-center justify-between mb-4 border-b pb-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              className="w-5 h-5 rounded text-brand-primary"
                              checked={!plan.hidden}
                              onChange={(e) =>
                                updatePricingPlan(
                                  pIdx,
                                  "hidden",
                                  !e.target.checked,
                                )
                              }
                            />
                            <h4 className="font-black text-lg">
                              노출하기 (플랜 {pIdx + 1})
                            </h4>
                          </div>
                          <button
                            onClick={() => deletePricingPlan(pIdx)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="요금제 삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">
                              플랜 이름
                            </label>
                            <input
                              type="text"
                              className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2"
                              value={plan.name}
                              onChange={(e) =>
                                updatePricingPlan(pIdx, "name", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">
                              플랜 설명
                            </label>
                            <input
                              type="text"
                              className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2"
                              value={plan.subtitle}
                              onChange={(e) =>
                                updatePricingPlan(
                                  pIdx,
                                  "subtitle",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">
                                월 기본 가격(원)
                              </label>
                              <input
                                type="number"
                                className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2"
                                value={plan.monthlyPrice}
                                onChange={(e) =>
                                  updatePricingPlan(
                                    pIdx,
                                    "monthlyPrice",
                                    Number(e.target.value),
                                  )
                                }
                              />
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-bold text-gray-500">
                                  개별 할인율(%)
                                </label>
                                <div className="flex items-center gap-3">
                                  <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      className="w-3.5 h-3.5 text-brand-primary rounded"
                                      checked={plan.applyIndividualDiscountToYearly ?? false}
                                      onChange={(e) =>
                                        updatePricingPlan(pIdx, "applyIndividualDiscountToYearly", e.target.checked)
                                      }
                                      disabled={!(plan.individualDiscountEnabled ?? true)}
                                    />
                                    <span className={`text-[11px] font-bold ${!(plan.individualDiscountEnabled ?? true) ? 'text-gray-400' : 'text-gray-500 hover:text-gray-700'}`}>연간 적용</span>
                                  </label>
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      className="sr-only peer"
                                      checked={plan.individualDiscountEnabled ?? true}
                                      onChange={(e) => updatePricingPlan(pIdx, "individualDiscountEnabled", e.target.checked)}
                                    />
                                    <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-brand-primary"></div>
                                  </label>
                                </div>
                              </div>
                              <input
                                type="number"
                                className={`w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 ${
                                  !(plan.individualDiscountEnabled ?? true) ? "bg-gray-100 text-gray-400 opacity-50 cursor-not-allowed" : ""
                                }`}
                                value={plan.individualDiscountRate}
                                onChange={(e) =>
                                  updatePricingPlan(
                                    pIdx,
                                    "individualDiscountRate",
                                    Number(e.target.value),
                                  )
                                }
                                disabled={!(plan.individualDiscountEnabled ?? true)}
                              />
                            </div>
                          </div>

                          <div className="pt-4 border-t border-gray-100 mt-2 mb-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={plan.qrServiceEnabled ?? false}
                                onChange={(e) => updatePricingPlan(pIdx, "qrServiceEnabled", e.target.checked)}
                                className="w-4 h-4 rounded text-brand-primary border-gray-300"
                              />
                              <span className="text-sm font-bold text-gray-700">"QR 서비스 관리" 메뉴 권한 부여 (마이페이지 표시)</span>
                            </label>
                          </div>

                          <div className="space-y-2 pt-2 border-t mt-2">
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                포함된 기능 (Details)
                              </label>
                              <button
                                onClick={() => addPlanFeature(pIdx)}
                                className="flex items-center gap-1 text-[11px] font-bold text-brand-primary"
                              >
                                <Plus className="w-3 h-3" /> 추가
                              </button>
                            </div>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                              <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={(e) =>
                                  handlePricingFeaturesDragEnd(pIdx, e)
                                }
                              >
                                <SortableContext
                                  items={plan.features.map((f) => f.id)}
                                  strategy={verticalListSortingStrategy}
                                >
                                  {plan.features.map((feature, fIdx) => (
                                    <SortableDetailItem
                                      key={feature.id}
                                      planIndex={pIdx}
                                      featureIndex={fIdx}
                                      feature={feature}
                                      onUpdate={updatePlanFeature}
                                      onDelete={deletePlanFeature}
                                    />
                                  ))}
                                </SortableContext>
                              </DndContext>
                              {plan.features.length === 0 && (
                                <div className="text-[11px] text-gray-400 py-2 border-2 border-dashed border-gray-100 rounded-lg text-center">
                                  기능 상셰 내용을 추가해주세요.
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="pt-2 border-t mt-2">
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-xs font-bold text-gray-500 inline-flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={plan.isPopular}
                                  onChange={(e) =>
                                    updatePricingPlan(
                                      pIdx,
                                      "isPopular",
                                      e.target.checked,
                                    )
                                  }
                                  className="rounded text-brand-primary"
                                />
                                인기 플랜 (Popular) 표시
                              </label>
                            </div>
                            {plan.isPopular && (
                              <input
                                type="text"
                                className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 mb-2"
                                placeholder="MOST POPULAR"
                                value={plan.popularText}
                                onChange={(e) =>
                                  updatePricingPlan(
                                    pIdx,
                                    "popularText",
                                    e.target.value,
                                  )
                                }
                              />
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">
                                버튼 텍스트
                              </label>
                              <input
                                type="text"
                                className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2"
                                value={plan.buttonText}
                                onChange={(e) =>
                                  updatePricingPlan(
                                    pIdx,
                                    "buttonText",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">
                                버튼 동작
                              </label>
                              <select
                                className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 bg-white"
                                value={plan.buttonLink === '#' ? 'auth' : plan.buttonLink === '#inquiry' ? 'inquiry' : 'link'}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  let newLink = '#';
                                  let newText = plan.buttonText;
                                  if (val === 'auth') { 
                                    newLink = '#';
                                  } else if (val === 'inquiry') { 
                                    newLink = '#inquiry';
                                  } else { 
                                    newLink = 'https://';
                                  }
                                  updatePricingPlan(pIdx, "buttonLink", newLink);
                                }}
                              >
                                <option value="auth">시작/무료체험 (가입창)</option>
                                <option value="inquiry">도입 문의하기 (문의창)</option>
                                <option value="link">사용자 정의 (외부 링크)</option>
                              </select>
                            </div>
                          </div>
                          {plan.buttonLink !== '#' && plan.buttonLink !== '#inquiry' && (
                             <div className="mt-2 text-right">
                                <label className="block text-xs text-gray-400 mb-1 text-left">연결할 URL (외부 링크)</label>
                                <input
                                  type="text"
                                  className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2"
                                  value={plan.buttonLink}
                                  onChange={(e) =>
                                    updatePricingPlan(
                                      pIdx,
                                      "buttonLink",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="https://"
                                />
                             </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* AI Refinement History Modal */}
      {historyModalOpenId && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <History className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">AI 수정 내역 히스토리</h3>
                  <p className="text-sm text-gray-500 font-medium">이전 작업 내용을 확인하고 롤백할 수 있습니다.</p>
                </div>
              </div>
              <button 
                onClick={() => setHistoryModalOpenId(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-all"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
              {(() => {
                const layer = draft.layers?.find(l => l.id === historyModalOpenId);
                const history = layer?.refinementHistory || [];
                
                if (history.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                      <Clock className="w-12 h-12 mb-4 opacity-20" />
                      <p className="text-lg font-medium">아직 수정 내역이 없습니다.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-6">
                    {[...history].reverse().map((item, idx) => (
                      <div key={item.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 50}ms` }}>
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Ver {history.length - idx}
                            </span>
                            <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {new Date(item.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRollback(historyModalOpenId, item.id)}
                            className="flex items-center gap-2 px-4 py-1.5 bg-gray-900 hover:bg-black text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> 이 버전으로 롤백
                          </button>
                        </div>
                        <div className="p-6">
                          <div className="mb-4">
                            <label className="block text-[10px] font-black text-emerald-600 mb-1 uppercase tracking-wider text-left">Prompt</label>
                            <div className="p-3 bg-emerald-50/50 rounded-xl text-sm text-emerald-900 border border-emerald-100/50 font-medium text-left">
                              {item.prompt}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-wider text-left">Before</label>
                              <div className="p-3 bg-gray-50 rounded-xl text-[10px] font-mono text-gray-500 border border-gray-100 h-32 overflow-y-auto whitespace-pre-wrap text-left">
                                {item.beforeContent}
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-brand-primary mb-1 uppercase tracking-wider text-left">After</label>
                              <div className="p-3 bg-indigo-50/30 rounded-xl text-[10px] font-mono text-indigo-900 border border-indigo-100 h-32 overflow-y-auto whitespace-pre-wrap text-left">
                                {item.afterContent}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
            
            <div className="p-6 border-t bg-gray-50/50 flex justify-end">
              <button
                onClick={() => setHistoryModalOpenId(null)}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
              >
                닫기
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Promo Preset Preview Modal */}
      {isPromoPreviewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Bot className="w-6 h-6 text-brand-primary" />
                AI 생성 홍보글 미리보기 (임시)
              </h3>
              <button 
                onClick={() => setIsPromoPreviewOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="닫기"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-sm md:text-base font-medium text-gray-800 whitespace-pre-wrap leading-relaxed">
                {samplePromoContent}
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50/50 flex justify-end gap-3">
              <button
                onClick={() => setIsPromoPreviewOpen(false)}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
              >
                닫기
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
             onClick={() => setPreviewImage(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center pointer-events-none"
          >
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors bg-black/20 hover:bg-black/40 rounded-full p-2 pointer-events-auto"
            >
              <Icons.X className="w-6 h-6" />
            </button>
            <img 
              src={previewImage} 
              alt="Preview" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        </div>
      )}

    </motion.div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
        active
          ? "bg-brand-primary/10 text-brand-primary"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
