import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Plus, Trash2, Save, Link as LinkIcon } from 'lucide-react';

export interface ChatbotOption {
  label: string;
  nextId: string | 'LIVE_CHAT' | null;
  actionType?: 'node' | 'link' | 'modal';
  modalId?: 'terms' | 'privacy' | 'inquiry' | '';
  url?: string;
  target?: '_self' | '_blank';
}

export interface ChatbotNode {
  id: string;
  title?: string;
  message: string;
  options: ChatbotOption[];
}

export interface ChatbotConfig {
  greetingMember: string;
  greetingNonMember: string;
  nodes: ChatbotNode[];
}

export const CS_CONFIG_TITLE = "SYSTEM_CHATBOT_CONFIG";

export const DEFAULT_CHATBOT_NODES: ChatbotNode[] = [
  {
    id: "root",
    title: "시작 (루트)",
    message: "안녕하세요! 헤어딜 고객센터입니다. 무엇을 도와드릴까요?",
    options: [
      { label: "요금 안내", nextId: "pricing", actionType: 'node' },
      { label: "서비스 이용 방법", nextId: "usage", actionType: 'node' },
      { label: "크레딧 결제 및 환불", nextId: "refund", actionType: 'node' },
      { label: "상담사 연결", nextId: "LIVE_CHAT", actionType: 'node' }
    ]
  },
  {
    id: "pricing",
    title: "요금 안내",
    message: "저희 헤어딜은 베이직, 프로, 프리미엄 요금제를 제공하고 있습니다.",
    options: [
      { label: "처음으로 돌아가기", nextId: "root", actionType: 'node' }
    ]
  },
  {
    id: "usage",
    title: "서비스 이용 방법",
    message: "회원 가입 후 'AI 헤어모델 생성' 메뉴에서 원하시는 스타일을 선택하시고 생성 버튼을 누르시면 됩니다.",
    options: [
      { label: "처음으로 돌아가기", nextId: "root", actionType: 'node' }
    ]
  },
  {
    id: "refund",
    title: "환불",
    message: "마이페이지 > 크레딧 내역에서 결제 및 관리가 가능합니다. 환불 정책에 대한 자세한 내용은 이용약관을 참고하시기 바랍니다.",
    options: [
      { label: "처음으로 돌아가기", nextId: "root", actionType: 'node' }
    ]
  }
];

export default function ChatbotEditor() {
  const [config, setConfig] = useState<ChatbotConfig>({
    greetingMember: "안녕하세요! {이름} 회원님! 고객센터입니다. 무엇을 도와드릴까요?",
    greetingNonMember: "안녕하세요! 헤어딜 고객센터입니다. 무엇을 도와드릴까요?",
    nodes: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("root"); // "settings" for global config

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const { data: rows, error } = await supabase
        .from('cs_notices')
        .select('content')
        .eq('title', CS_CONFIG_TITLE)
        .limit(1);
      
      const data = rows?.[0];
      
      if (data && data.content) {
        const parsed = JSON.parse(data.content);
        if (Array.isArray(parsed)) {
           // Migration from older version
           setConfig({
              greetingMember: "안녕하세요! {이름} 회원님! 고객센터입니다. 무엇을 도와드릴까요?",
              greetingNonMember: "안녕하세요! 헤어딜 고객센터입니다. 무엇을 도와드릴까요?",
              nodes: parsed
           });
        } else {
           setConfig({
              greetingMember: parsed.greetingMember || "안녕하세요! {이름} 회원님! 고객센터입니다. 무엇을 도와드릴까요?",
              greetingNonMember: parsed.greetingNonMember || "안녕하세요! 헤어딜 고객센터입니다. 무엇을 도와드릴까요?",
              nodes: parsed.nodes || DEFAULT_CHATBOT_NODES
           });
        }
      } else {
        setConfig({ ...config, nodes: DEFAULT_CHATBOT_NODES });
      }
    } catch (err) {
      console.error("Failed to load generic config", err);
      setConfig({ ...config, nodes: DEFAULT_CHATBOT_NODES });
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: rows } = await supabase
        .from('cs_notices')
        .select('id')
        .eq('title', CS_CONFIG_TITLE)
        .limit(1);

      const existing = rows?.[0];

      if (existing) {
        await supabase.from('cs_notices').update({
          content: JSON.stringify(config)
        }).eq('id', existing.id);
      } else {
        await supabase.from('cs_notices').insert([{
          title: CS_CONFIG_TITLE,
          content: JSON.stringify(config),
          is_published: false
        }]);
      }
      alert("성공적으로 저장되었습니다.");
    } catch (err) {
      console.error(err);
      alert("저장 중 오류가 발생했습니다.");
    }
    setIsSaving(false);
  };

  const selectedNode = config.nodes.find(n => n.id === selectedNodeId);

  const updateNodeMessage = (message: string) => {
    setConfig({ ...config, nodes: config.nodes.map(n => n.id === selectedNodeId ? { ...n, message } : n) });
  };

  const updateNodeTitle = (title: string) => {
    setConfig({ ...config, nodes: config.nodes.map(n => n.id === selectedNodeId ? { ...n, title } : n) });
  };

  const addOption = () => {
    setConfig({ ...config, nodes: config.nodes.map(n => {
      if (n.id === selectedNodeId) {
        return { ...n, options: [...n.options, { label: '새 옵션', nextId: null, actionType: 'node', url: '', target: '_self' }] };
      }
      return n;
    })});
  };

  const updateOption = (index: number, updates: Partial<ChatbotOption>) => {
    setConfig({ ...config, nodes: config.nodes.map(n => {
      if (n.id === selectedNodeId) {
        const newOpts = [...n.options];
        newOpts[index] = { ...newOpts[index], ...updates };
        return { ...n, options: newOpts };
      }
      return n;
    })});
  };

  const removeOption = (index: number) => {
    setConfig({ ...config, nodes: config.nodes.map(n => {
      if (n.id === selectedNodeId) {
        const newOpts = [...n.options];
        newOpts.splice(index, 1);
        return { ...n, options: newOpts };
      }
      return n;
    })});
  };

  const addNewNode = () => {
    const id = "node_" + Math.random().toString(36).substring(2, 6);
    setConfig({ ...config, nodes: [...config.nodes, { id, title: "새로운 노드", message: "새로운 지문입니다.", options: [] }] });
    setSelectedNodeId(id);
  };

  const removeNode = (id: string) => {
    if (id === 'root') return alert("루트(최초 시작) 노드는 삭제할 수 없습니다.");
    setConfig({ ...config, nodes: config.nodes.filter(n => n.id !== id) });
    if (selectedNodeId === id) setSelectedNodeId("root");
  };

  if (isLoading) return <div>로딩중...</div>;

  return (
    <div className="flex h-full min-h-[600px] border border-gray-200 bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Node List */}
      <div className="w-1/3 min-w-[250px] border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">시나리오 관리</h2>
          <button onClick={addNewNode} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-700" title="새 노드 추가">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div
            onClick={() => setSelectedNodeId("settings")}
            className={`p-4 border-b border-gray-200 cursor-pointer flex justify-between items-center transition-colors ${selectedNodeId === "settings" ? 'bg-amber-50 border-l-4 border-l-amber-500' : 'hover:bg-gray-100'}`}
          >
            <div>
              <div className="font-bold text-sm text-gray-900">⚙️ 글로벌 설정 (인사말 등)</div>
            </div>
          </div>
          {config.nodes.map(node => (
            <div
              key={node.id}
              onClick={() => setSelectedNodeId(node.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer flex justify-between items-center transition-colors ${selectedNodeId === node.id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : 'hover:bg-gray-100'}`}
            >
              <div>
                <div className="font-bold text-sm text-gray-900">{node.id === 'root' ? '🏠 ' : ''}{node.title || node.id}</div>
                <div className="text-xs text-gray-500 truncate mt-1 w-40">{node.message}</div>
              </div>
              {node.id !== 'root' && (
                <button onClick={(e) => { e.stopPropagation(); removeNode(node.id); }} className="text-gray-400 hover:text-red-500 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Node Editor */}
      <div className="w-2/3 p-6 flex flex-col bg-white overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            {selectedNodeId === 'settings' ? '글로벌 설정 (상담사 연결 등)' : (
              <>노드 편집: <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-base">{selectedNode?.id}</span></>
            )}
          </h2>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "저장중..." : "변경사항 저장하기"}
          </button>
        </div>

        {selectedNodeId === 'settings' ? (
           <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-sm text-amber-800 mb-4">
                 상담사 연결 시 고객에게 자동으로 전송될 첫 인사말을 설정합니다. <br/>
                 <b>{`{이름}`}</b> 변수 사용 시 고객의 이름으로 치환됩니다. (예: <b>김고객</b>님) 이 변수는 챗봇 노드의 출력 메시지에서도 사용할 수 있습니다.
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">회원용 상담사 봇 인사말</label>
                <textarea
                  value={config.greetingMember}
                  onChange={(e) => setConfig({...config, greetingMember: e.target.value})}
                  placeholder="안녕하세요! {이름} 회원님!..."
                  className="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:border-indigo-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">비회원용 상담사 봇 인사말</label>
                <textarea
                  value={config.greetingNonMember}
                  onChange={(e) => setConfig({...config, greetingNonMember: e.target.value})}
                  placeholder="안녕하세요! 비회원 고객님!..."
                  className="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:border-indigo-500 outline-none text-sm"
                />
              </div>
           </div>
        ) : selectedNode ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">노드명 (표시용)</label>
              <input
                type="text"
                value={selectedNode.title || selectedNode.id}
                onChange={(e) => updateNodeTitle(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none text-sm mb-4"
              />

              <label className="block text-sm font-bold text-gray-700 mb-2">챗봇 출력 메시지 <span className="text-xs font-normal text-gray-500">({`{이름}`} 변수 사용 가능)</span></label>
              <textarea
                value={selectedNode.message}
                onChange={(e) => updateNodeMessage(e.target.value)}
                className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:border-indigo-500 outline-none text-sm"
              />
            </div>
            
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <span className="font-bold text-sm text-gray-700">고객 응답 선택지 (버튼)</span>
                <button onClick={addOption} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 py-1 px-2 border border-indigo-200 rounded sm:border-0 sm:p-0">
                  <Plus className="w-3 h-3" /> 항목 추가
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                {selectedNode.options.length === 0 && <p className="text-sm text-gray-400 text-center py-2">등록된 선택지가 없습니다. (답변 후 종료됨)</p>}
                {selectedNode.options.map((opt, i) => (
                  <div key={i} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 relative">
                    <button onClick={() => removeOption(i)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 rounded-lg" title="삭제"><Trash2 className="w-4 h-4" /></button>
                    
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center pr-8">
                       <input 
                         type="text" 
                         value={opt.label}
                         onChange={(e) => updateOption(i, { label: e.target.value })}
                         placeholder="버튼 라벨 (예: 요금 안내)"
                         className="w-full sm:flex-1 px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm outline-none focus:border-indigo-500 min-w-[120px]"
                       />
                       
                       <div className="flex gap-2 w-full sm:w-auto">
                          <select 
                            value={opt.actionType || 'node'}
                            onChange={(e) => updateOption(i, { actionType: e.target.value as any })}
                            className="px-2 py-2 border border-gray-300 bg-white rounded-lg text-sm outline-none focus:border-indigo-500"
                          >
                             <option value="node">노드 이동</option>
                             <option value="link">기타 링크 / 페이지 이동</option>
                             <option value="modal">모달(팝업) 띄우기</option>
                          </select>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full mt-1">
                      <LinkIcon className="w-4 h-4 text-gray-400 shrink-0" />
                      {(!opt.actionType || opt.actionType === 'node') ? (
                         <select
                           value={opt.nextId || ''}
                           onChange={(e) => updateOption(i, { nextId: e.target.value || null })}
                           className="flex-1 px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm outline-none focus:border-indigo-500"
                         >
                           <option value="">-- 이동할 노드 선택 --</option>
                           <option value="LIVE_CHAT" className="font-bold text-indigo-600">🎧 실시간 상담사 연결</option>
                           {config.nodes.map(n => (
                             <option key={n.id} value={n.id}>{n.title || n.id}</option>
                           ))}
                         </select>
                      ) : opt.actionType === 'modal' ? (
                         <select
                           value={opt.modalId || ''}
                           onChange={(e) => updateOption(i, { modalId: e.target.value as any })}
                           className="flex-1 px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm outline-none focus:border-indigo-500"
                         >
                           <option value="">-- 모달 항목 선택 --</option>
                           <option value="terms">서비스 이용약관</option>
                           <option value="privacy">개인정보처리방침</option>
                           <option value="inquiry">도입 문의하기</option>
                         </select>
                      ) : (
                         <div className="flex flex-col sm:flex-row gap-2 w-full">
                            <input
                              type="text"
                              value={opt.url || ''}
                              onChange={(e) => updateOption(i, { url: e.target.value })}
                              placeholder="경로 (예: /pricing, https://...)"
                              className="flex-1 px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm outline-none focus:border-indigo-500"
                            />
                            <select
                              value={opt.target || '_self'}
                              onChange={(e) => updateOption(i, { target: e.target.value as any })}
                              className="px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm outline-none focus:border-indigo-500"
                            >
                               <option value="_self">현재 창 (_self)</option>
                               <option value="_blank">새 창 (_blank)</option>
                            </select>
                         </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
