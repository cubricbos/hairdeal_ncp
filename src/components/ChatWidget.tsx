import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, User as UserIcon, Bot, Headset, Star } from 'lucide-react';
import { supabase } from '../supabase';
import { User } from '@supabase/supabase-js';
import { ChatbotNode, ChatbotConfig, ChatbotOption, CS_CONFIG_TITLE, DEFAULT_CHATBOT_NODES } from './ChatbotEditor';

// Types
type SenderType = 'user' | 'bot' | 'admin';
export interface Message {
  id: string;
  sender: SenderType;
  content: string;
  created_at: string;
}

export interface ChatWidgetProps {
  user: User | null;
}

export default function ChatWidget({ user }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [chatStatus, setChatStatus] = useState<'none' | 'waiting' | 'active' | 'closed' | 'rating'>('none');
  const [config, setConfig] = useState<ChatbotConfig>({
     greetingMember: "안녕하세요! {이름} 회원님! 고객센터입니다. 무엇을 도와드릴까요?",
     greetingNonMember: "안녕하세요! 헤어딜 고객센터입니다. 무엇을 도와드릴까요?",
     nodes: DEFAULT_CHATBOT_NODES
  });
  const [currentNodeId, setCurrentNodeId] = useState<string>('root');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Create or get local session ID for anonymous users
  const getSessionId = () => {
    let sid = localStorage.getItem('cs_session_id');
    if (!sid) {
      sid = 'session_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('cs_session_id', sid);
    }
    return sid;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Load config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const { data: rows } = await supabase.from('cs_notices').select('content').eq('title', CS_CONFIG_TITLE).limit(1);
        const data = rows?.[0];
        if (data && data.content) {
           const parsed = JSON.parse(data.content);
           if (Array.isArray(parsed)) {
             setConfig(prev => ({ ...prev, nodes: parsed }));
           } else {
             setConfig({
                greetingMember: parsed.greetingMember || "안녕하세요! {이름} 회원님! 고객센터입니다. 무엇을 도와드릴까요?",
                greetingNonMember: parsed.greetingNonMember || "안녕하세요! 헤어딜 고객센터입니다. 무엇을 도와드릴까요?",
                nodes: parsed.nodes || DEFAULT_CHATBOT_NODES
             });
           }
        }
      } catch (err) {}
    };
    loadConfig();
  }, []);

  const replaceVars = (msg: string) => {
     const name = user?.user_metadata?.full_name || '고객';
     return msg.replace(/{이름}/g, name).replace(/{이름님}/g, `${name}님`);
  };

  // Initialize Chat
  useEffect(() => {
    if (messages.length === 0 && config.nodes.length > 0 && chatStatus === 'none') {
      // Check last chat
      const lastChatDate = localStorage.getItem('cs_last_chat_date');
      const today = new Date().toDateString();
      if (lastChatDate === today) {
         // Has history today, wait for user choice
         setMessages([{
           id: 'welcome',
           sender: 'bot',
           content: '오늘 진행하신 상담 내역이 있습니다. 이어서 문의하시겠습니까?',
           created_at: new Date().toISOString()
         }]);
      } else {
         startNewChatFlow();
      }
    }
  }, [config.nodes]);

  const startNewChatFlow = () => {
     localStorage.setItem('cs_last_chat_date', new Date().toDateString());
     setChatId(null);
     setIsLiveActive(false);
     setChatStatus('none');
     setCurrentNodeId('root');
     const rootNode = config.nodes.find(n => n.id === 'root') || config.nodes[0];
     setMessages([{
       id: crypto.randomUUID(),
       sender: 'bot',
       content: rootNode?.message ? replaceVars(rootNode.message) : '안녕하세요! 무엇을 도와드릴까요?',
       created_at: new Date().toISOString()
     }]);
  };

  const resumeChatFlow = async () => {
     const lastChatId = localStorage.getItem('cs_last_chat_id');
     if (lastChatId) {
        setChatId(lastChatId);
        // Load messages from DB
        const { data: pastMessages } = await supabase
          .from('support_messages')
          .select('*')
          .eq('chat_id', lastChatId)
          .order('created_at', { ascending: true });
        
        if (pastMessages && pastMessages.length > 0) {
           setMessages(pastMessages);
           // check chat status
           const { data: chatData } = await supabase.from('support_chats').select('status').eq('id', lastChatId).single();
           if (chatData) {
              setChatStatus(chatData.status);
              if (chatData.status === 'active' || chatData.status === 'waiting') {
                 setIsLiveActive(true);
              } else if (chatData.status === 'closed') {
                 setChatStatus('rating'); // Prompt rating again if closed and not rated?
                 // Or just let them see the history and end.
                 setMessages(prev => [...prev, {
                    id: crypto.randomUUID(),
                    sender: 'bot',
                    content: '이전 상담이 이미 종료되었습니다. 새로운 상담을 원하시면 처음부터 다시 시작해주세요.',
                    created_at: new Date().toISOString()
                 }]);
              }
           }
        } else {
           startNewChatFlow();
        }
     } else {
        startNewChatFlow();
     }
  };

  // Subscribe to Live Status & Messages
  useEffect(() => {
    if (!chatId) return;

    // Chat status changes
    const chatChannel = supabase
      .channel(`chat_status_${chatId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'support_chats', filter: `id=eq.${chatId}` }, (payload) => {
        if (payload.new.status === 'closed') {
           setIsLiveActive(false);
           setChatStatus('rating');
           setMessages(prev => [...prev, {
              id: crypto.randomUUID(),
              sender: 'bot',
              content: '상담이 종료되었습니다. 상담 내용에 만족하셨나요? 별점을 남겨주시면 감사하겠습니다.',
              created_at: new Date().toISOString()
           }]);
        } else if (payload.new.status === 'active') {
           setChatStatus('active');
        }
      })
      .subscribe();

    // Live messages
    const msgChannel = supabase
      .channel(`chat_messages_${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'support_messages',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        const newMessage = payload.new as Message;
        setMessages(prev => {
          if (prev.find(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
      supabase.removeChannel(msgChannel);
    };
  }, [chatId]);

  const handleNodeReply = async (opt: ChatbotOption) => {
    const userMsg: Message = { id: crypto.randomUUID(), sender: 'user', content: opt.label, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);

    if (opt.actionType === 'modal' && opt.modalId) {
      if (opt.modalId === 'terms' || opt.modalId === 'privacy') {
        window.dispatchEvent(new CustomEvent('open-policy', { detail: opt.modalId }));
      } else if (opt.modalId === 'inquiry') {
        window.dispatchEvent(new CustomEvent('open-inquiry'));
      }
      setTimeout(() => {
         setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            sender: 'bot',
            content: "창을 띄웠습니다. 확인해 주세요.",
            created_at: new Date().toISOString()
         }]);
      }, 300);
      return;
    }

    if (opt.actionType === 'link' || (!opt.actionType && opt.url)) {
      if (opt.url) window.open(opt.url, opt.target || '_self');
      setTimeout(() => {
         setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            sender: 'bot',
            content: "요청하신 페이지로 이동합니다.",
            created_at: new Date().toISOString()
         }]);
      }, 300);
      return;
    }

    if (opt.nextId === 'LIVE_CHAT') {
      await startLiveChat();
    } else if (opt.nextId) {
      setCurrentNodeId(opt.nextId);
      const nextNode = config.nodes.find(n => n.id === opt.nextId);
      if (nextNode) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            sender: 'bot',
            content: replaceVars(nextNode.message),
            created_at: new Date().toISOString()
          }]);
        }, 600);
      }
    }
  };

  const startLiveChat = async () => {
    try {
      setMessages([]); // Clear previous chatbot history for a clean start
      const sessionId = getSessionId();
      
      const { data: newChat, error } = await supabase.from('support_chats').insert([{
        user_id: user?.id || null,
        session_id: sessionId,
        status: 'waiting'
      }]).select().single();
      
      if (error) throw error;
      
      const newChatId = newChat.id;
      setChatId(newChatId);
      setIsLiveActive(true);
      setChatStatus('waiting');
      localStorage.setItem('cs_last_chat_id', newChatId);

    } catch (err) {
      console.error("Failed to start live chat:", err);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        sender: 'bot',
        content: '(DB 에러) 현재 상담사 연결이 지연되고 있습니다. 나중에 다시 시도해주세요.',
        created_at: new Date().toISOString()
      }]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const msgId = crypto.randomUUID();
    const userMessage: Message = {
      id: msgId,
      sender: 'user',
      content: inputValue,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    if (isLiveActive && chatId) {
      try {
        await supabase.from('support_messages').insert([{
          id: msgId,
          chat_id: chatId,
          sender: 'user',
          content: userMessage.content
        }]);
      } catch (err) {
        console.error("Error sending message to DB:", err);
      }
    } else {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          sender: 'bot',
          content: "원하시는 메뉴를 위에서 선택하시거나, 상세 문의는 '상담사 연결'을 진행해주세요.",
          created_at: new Date().toISOString()
        }]);
      }, 800);
    }
  };

  const handleRating = async (rating: number) => {
     if (chatId) {
        try {
           await supabase.from('support_messages').insert([{
             chat_id: chatId,
             sender: 'bot',
             content: `[SYSTEM_RATING] ${rating}`
           }]);
        } catch (err) {
           console.error("Failed to send rating", err);
        }
     }
     setChatStatus('none');
     setIsOpen(false);
  };

  const currentNode = config.nodes.find(n => n.id === currentNodeId);
  const isHistoryPrompt = messages.length === 1 && messages[0].content.includes('오늘 진행하신 상담');
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-[88px] right-4 left-4 md:left-auto md:right-6 md:bottom-24 w-auto md:w-[380px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col z-[100] overflow-hidden"
            style={{ height: '600px', maxHeight: 'calc(100vh - 120px)' }}
          >
            {/* Header */}
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">
                  <Headset className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-lg">고객센터</h3>
                  <p className="text-[11px] text-gray-300">
                    {chatStatus === 'waiting' ? "상담사 연결 중..." : 
                     chatStatus === 'active' ? "상담사와 연결됨" : 
                     "24시간 AI/상담사 챗봇"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
              {messages.map((msg, index) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  {msg.sender !== 'user' && (
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.sender === 'bot' ? 'bg-indigo-100 text-indigo-600' : 'bg-brand-primary text-white'}`}>
                      {msg.sender === 'bot' ? <Bot className="w-4 h-4" /> : <Headset className="w-4 h-4" />}
                    </div>
                  )}
                  
                  <div className={`rounded-2xl px-4 py-2.5 text-sm ${
                    msg.sender === 'user' 
                      ? 'bg-slate-900 text-white rounded-tr-sm' 
                      : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-tl-sm'
                  }`}>
                    {msg.content.startsWith('[SYSTEM_RATING]') ? (
                       <div className="flex gap-1 text-yellow-400">
                         {Array.from({ length: parseInt(msg.content.split(' ')[1]) || 5 }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                         ))}
                       </div>
                    ) : (
                       msg.content
                    )}
                  </div>
                </div>
              ))}
              
              {!isLiveActive && chatStatus !== 'rating' && isHistoryPrompt && (
                <div className="flex flex-col gap-2 mt-2">
                  <button onClick={resumeChatFlow} className="w-full py-2 bg-brand-primary text-white text-sm font-bold rounded-xl hover:bg-brand-primary/90 transition-colors">이어서 문의하기</button>
                  <button onClick={startNewChatFlow} className="w-full py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors">신규 문의하기</button>
                </div>
              )}

              {!isLiveActive && chatStatus !== 'rating' && !isHistoryPrompt && currentNode && currentNode.options.length > 0 && messages[messages.length - 1]?.sender === 'bot' && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentNode.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleNodeReply(opt)}
                      className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs rounded-xl hover:border-brand-primary hover:text-brand-primary transition-colors font-medium shadow-sm"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {chatStatus === 'rating' && (
                <div className="flex flex-col mt-4">
                   <div className="flex gap-2 justify-center mb-2">
                      {[1, 2, 3, 4, 5].map(star => (
                         <button key={star} onClick={() => handleRating(star)} className="p-2 hover:scale-110 transition-transform">
                            <Star className="w-8 h-8 text-yellow-400 opacity-50 hover:opacity-100 hover:fill-current transition-all" />
                         </button>
                      ))}
                   </div>
                </div>
              )}
              
              {chatStatus === 'waiting' && (
                <div className="flex items-center gap-3 text-brand-primary text-[11px] font-black px-4 py-3 bg-white rounded-2xl self-start ml-11 border border-indigo-100 shadow-sm animate-pulse">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce"></span>
                  </div>
                  <span>상담사를 신속하게 연결 중입니다. 잠시만 대기해 주세요.!</span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={chatStatus === 'active' ? "메시지를 입력하세요..." : 
                               chatStatus === 'waiting' ? "상담사 연결 대기 중..." : 
                               "메뉴를 선택하거나 상담사 연결을 누르세요"}
                  disabled={(chatStatus !== 'active' && chatStatus !== 'none') || chatStatus === 'rating'} 
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-brand-primary disabled:opacity-50 text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || chatStatus === 'rating'}
                  className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-sm disabled:opacity-50 disabled:bg-gray-300 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-4 md:right-6 w-14 h-14 bg-slate-900 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-transform z-[90] group"
      >
        <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>
    </>
  );
}
