import React from "react";
import { Plus, Trash2, RefreshCw, AlertCircle, CheckCircle2, GripVertical, Key } from "lucide-react";
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
import { useSiteContext } from "../../context/SiteContext";

interface SortableApiKeyProps {
  key?: React.Key;
  apiKeyObj: any;
  isCurrentlyUsed: boolean;
  onUpdate: (id: string, key: string, value: any) => void;
  onRemove: (id: string) => void;
}

const SortableApiKey = ({
  apiKeyObj,
  isCurrentlyUsed,
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
  
  const remainingTokens = apiKeyObj.isExhausted 
    ? 0 
    : Math.max(0, DAILY_QUOTA - (apiKeyObj.usageCount || 0));
    
  const usagePercent = Math.min(
    100,
    ((DAILY_QUOTA - remainingTokens) / DAILY_QUOTA) * 100,
  );
  const isActive = apiKeyObj.isActive !== false;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex gap-3 items-start p-4 rounded-xl border-2 transition-all ${isDragging ? "z-50 opacity-50 relative" : ""} ${!isActive ? "bg-gray-50 border-gray-200" : apiKeyObj.isExhausted ? "bg-red-50/50 border-red-100 shadow-sm" : isCurrentlyUsed ? "bg-emerald-50/30 border-emerald-200 shadow-md ring-2 ring-emerald-500/10" : "bg-white border-gray-100 shadow-sm hover:border-brand-primary/30"}`}
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
            
            {isActive && (
              <>
                {apiKeyObj.isExhausted ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-wider">
                    <AlertCircle className="w-3 h-3" /> Exhausted
                  </span>
                ) : isCurrentlyUsed ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider shadow-sm animate-pulse">
                    <CheckCircle2 className="w-3 h-3" /> 현재 사용 중 (Active)
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 text-orange-600 text-[10px] font-bold uppercase tracking-wider">
                    <RefreshCw className="w-3 h-3" /> 대기 중 (Standby)
                  </span>
                )}
              </>
            )}

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
            <select
              className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 text-sm bg-white"
              value={apiKeyObj.model || "gemini-3-flash-preview"}
              onChange={(e) => onUpdate(apiKeyObj.id, "model", e.target.value)}
            >
              <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (최신/강력추천)</option>
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

export function GeminiApiKeyManager() {
  const { settings, updateSettings } = useSiteContext();
  const keys = settings?.integrations?.geminiApiKeys || [];

  // Find the currently used key (first active and not exhausted)
  const currentlyUsedKeyId = keys.find((k: any) => (k.isActive !== false) && !k.isExhausted)?.id;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const updateKeys = (newKeys: any[]) => {
    updateSettings({
      ...settings,
      integrations: {
        ...(settings?.integrations || {}),
        geminiApiKeys: newKeys,
      },
    });
  };

  const addGeminiApiKey = () => {
    const newKey = {
      id: Math.random().toString(36).substring(2, 9),
      key: "",
      model: "gemini-3-flash-preview",
      label: "제미나이 키 " + (keys.length + 1),
      isExhausted: false,
      usageCount: 0,
    };
    updateKeys([...keys, newKey]);
  };

  const removeGeminiApiKey = (id: string) => {
    updateKeys(keys.filter((k: any) => k.id !== id));
  };

  const _updateGeminiApiKey = (id: string, key: string, value: any) => {
    updateKeys(
      keys.map((k: any) => (k.id === id ? { ...k, [key]: value } : k))
    );
  };

  const handleApiKeyDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = keys.findIndex((k: any) => k.id === active.id);
      const newIndex = keys.findIndex((k: any) => k.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        updateKeys(arrayMove(keys, oldIndex, newIndex));
      }
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border mt-8">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-base">Google Gemini API (Multi-Key)</h4>
        <button
          onClick={addGeminiApiKey}
          className="text-sm font-bold text-brand-primary flex items-center gap-1 bg-white border border-brand-primary/20 px-3 py-1 rounded-lg hover:bg-brand-primary/5 transition-colors"
        >
          <Plus className="w-4 h-4" /> 키 추가
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-6">
        여러 개의 제미나이 API 키를 등록하여 할당량을 효율적으로 관리하세요.
        활성 키가 소진되면 다음 키로 자동 전환됩니다. 
        <br />
        <span className="text-[11px] text-orange-600 font-medium">
          * 참고: Pro 모델은 무료 티어에서 분당 2회(2 RPM)로 제한되므로, 빠른 생성을 원하시면 Flash 모델 사용을 권장합니다.
        </span>
      </p>

      <div className="space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleApiKeyDragEnd}
        >
          <SortableContext
            items={keys.map((k: any) => k.id)}
            strategy={verticalListSortingStrategy}
          >
            {keys.map((apiKeyObj: any) => (
              <SortableApiKey
                key={apiKeyObj.id}
                apiKeyObj={apiKeyObj}
                isCurrentlyUsed={apiKeyObj.id === currentlyUsedKeyId}
                onUpdate={_updateGeminiApiKey}
                onRemove={removeGeminiApiKey}
              />
            ))}
          </SortableContext>
        </DndContext>

        {(!keys || keys.length === 0) && (
          <div className="text-center py-10 border-2 border-dashed rounded-xl bg-white">
            <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Key className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 font-medium">
              등록된 Gemini API 키가 없습니다.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              우측 상단의 '키 추가' 버튼을 눌러 새 키를 등록하세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
