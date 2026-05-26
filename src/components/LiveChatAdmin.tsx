import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { MessageCircle, Send, Play, UserCircle } from 'lucide-react';
import { Message } from './ChatWidget';

interface SupportChat {
  id: string;
  user_id: string | null;
  session_id: string;
  status: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  full_name: string;
  credits: number;
  plan_tier: string;
  phone?: string;
  created_at: string;
}

export default function LiveChatAdmin({ adminUser }: { adminUser: SupabaseUser | null }) {
  const [chats, setChats] = useState<SupportChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<SupportChat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChats();

    // Subscribe to new chats
    const channel = supabase
      .channel('support_chats_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_chats' }, (payload) => {
        fetchChats();
        if (selectedChat?.id === (payload.new as any).id) {
           setSelectedChat(payload.new as SupportChat);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChat]);

  useEffect(() => {
    if (!selectedChat) return;

    fetchMessages(selectedChat.id);
    
    if (selectedChat.user_id) {
       fetchUserProfile(selectedChat.user_id);
    } else {
       setUserProfile(null);
    }

    const channel = supabase
      .channel(`chat_${selectedChat.id}_admin`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'support_messages',
        filter: `chat_id=eq.${selectedChat.id}`
      }, (payload) => {
        const newMessage = payload.new as Message;
        setMessages(prev => {
          if (prev.find(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChat?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChats = async () => {
    try {
      const { data, error } = await supabase
        .from('support_chats')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error("Error fetching chats:", error);
      } else {
        setChats(data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserProfile = async (userId: string) => {
     try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (!error && data) {
           setUserProfile(data);
        }
     } catch (err: any) {
        if (err?.message !== 'Failed to fetch' && err?.message !== 'FetchError') {
          console.error("Failed to fetch user profile", err);
        }
     }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (customMessage?: string) => {
    const msgContent = customMessage || inputValue;
    if (!msgContent.trim() || !selectedChat) return;

    if (!customMessage) setInputValue('');

    const msgId = crypto.randomUUID();
    const adminMsg: Message = {
      id: msgId,
      sender: 'admin',
      content: msgContent,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, adminMsg]);

    try {
      await supabase.from('support_messages').insert([{
        id: msgId,
        chat_id: selectedChat.id,
        sender: 'admin',
        content: msgContent
      }]);
    } catch (err) {
      console.error("Failed to send:", err);
    }
  };

  const handleStartChat = async () => {
     if (!selectedChat) return;
     
     try {
        await supabase.from('support_chats').update({ status: 'active' }).eq('id', selectedChat.id);
        
        let greetingMember = "안녕하세요! 상담사가 연결되었습니다. 무엇을 도와드릴까요?";
        let greetingNonMember = "안녕하세요! 상담사가 연결되었습니다. 무엇을 도와드릴까요?";
        
        try {
           const { data } = await supabase.from('cs_notices').select('content').eq('title', 'SYSTEM_CHATBOT_CONFIG').single();
           if (data && data.content) {
              const parsed = JSON.parse(data.content);
              if (!Array.isArray(parsed)) {
                 if (parsed.greetingMember) greetingMember = parsed.greetingMember;
                 if (parsed.greetingNonMember) greetingNonMember = parsed.greetingNonMember;
              }
           }
        } catch (err) {}

        const name = userProfile?.full_name || '고객';
        const finalGreeting = selectedChat.user_id 
           ? greetingMember.replace(/{이름}/g, name).replace(/{이름님}/g, `${name}님`)
           : greetingNonMember.replace(/{이름}/g, name).replace(/{이름님}/g, `${name}님`);
           
        await handleSendMessage(finalGreeting);
     } catch (err) {}
  };

  const handleCloseChat = async (chatId: string) => {
    try {
      await supabase.from('support_chats').update({ status: 'closed' }).eq('id', chatId);
    } catch (err) {
      console.error("Failed to close chat:", err);
    }
  };

  return (
    <div className="flex h-full min-h-[600px] border border-gray-200 bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Sidebar - Chat List */}
      <div className="w-1/4 min-w-[250px] border-r border-gray-200 bg-gray-50 overflow-y-auto flex flex-col">
        <div className="p-4 bg-white border-b border-gray-200 sticky top-0 z-10 hidden sm:block">
          <h2 className="font-bold text-gray-900">상담 목록</h2>
        </div>
        <div className="flex-1">
          {chats.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">진행 중인 채팅이 없습니다.</div>
          ) : (
            chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`w-full text-left p-4 border-b border-gray-100 transition-colors ${selectedChat?.id === chat.id ? 'bg-red-50 border-l-4 border-l-red-500' : 'hover:bg-gray-100'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-gray-900 truncate">
                    {chat.user_id ? "회원 문의" : "비회원 문의"}
                  </span>
                  {chat.status === 'waiting' && <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded font-bold">대기중</span>}
                  {chat.status === 'active' && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded font-bold">진행중</span>}
                  {chat.status === 'closed' && <span className="bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded font-bold">종료됨</span>}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {new Date(chat.created_at).toLocaleString()}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Area - Chat Messages */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedChat ? (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-bold text-gray-900">채팅방 상세 {selectedChat.user_id ? "(회원)" : "(비회원)"}</h3>
              {selectedChat.status !== 'closed' && (
                <button
                  onClick={() => handleCloseChat(selectedChat.id)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold border border-gray-200 hover:bg-gray-200 transition-colors"
                >
                  상담 종료
                </button>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 flex flex-col gap-4 relative">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm mt-10">메시지가 없습니다.</div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`flex max-w-[80%] ${msg.sender === 'admin' ? 'ml-auto' : 'mr-auto'}`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm ${
                      msg.sender === 'admin' 
                        ? 'bg-red-600 text-white rounded-br-sm' 
                        : (msg.sender === 'bot' ? 'bg-indigo-100 text-indigo-800' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm')
                    }`}>
                      {msg.sender === 'bot' && <div className="text-xs font-bold text-indigo-500 mb-1">🤖 봇 / 시스템</div>}
                      {msg.sender === 'user' && <div className="text-xs font-bold text-gray-400 mb-1">고객</div>}
                      {msg.content.startsWith('[SYSTEM_RATING]') ? '고객이 평가를 남겼습니다: ' + msg.content.split(' ')[1] + '점' : msg.content}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-white">
              {selectedChat.status === 'waiting' ? (
                 <button onClick={handleStartChat} className="w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition flex items-center justify-center gap-2">
                    <Play className="w-5 h-5" />
                    채팅 시작하기
                 </button>
              ) : selectedChat.status === 'closed' ? (
                 <div className="w-full py-4 bg-gray-100 text-gray-500 text-center rounded-xl font-bold border border-gray-200">
                    종료된 상담입니다.
                 </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                    placeholder="답변을 입력하세요..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-red-500 transition-colors"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim()}
                    className="px-6 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-red-600/20"
                  >
                    <Send className="w-4 h-4" />
                    전송
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageCircle className="w-12 h-12 mb-4 text-gray-200" />
            <p>좌측 목록에서 채팅을 선택해주세요.</p>
          </div>
        )}
      </div>

      {/* Right Sidebar - User Profile */}
      {selectedChat && selectedChat.user_id && (
         <div className="w-1/4 min-w-[250px] border-l border-gray-200 bg-gray-50 flex flex-col">
            <div className="p-4 bg-white border-b border-gray-200 sticky top-0">
              <h2 className="font-bold text-gray-900">회원 정보</h2>
            </div>
            {userProfile ? (
              <div className="p-4 space-y-6">
                 <div className="text-center">
                    <UserCircle className="w-16 h-16 text-gray-300 mx-auto mb-2" />
                    <div className="font-black text-lg text-gray-900">{userProfile.full_name || '이름 없음'}</div>
                    <div className="text-sm text-gray-500 mt-1">가입일: {new Date(userProfile.created_at).toLocaleDateString()}</div>
                 </div>
                 
                 <div className="space-y-3 border-t border-gray-200 pt-6">
                    <div className="flex justify-between items-center">
                       <span className="text-sm text-gray-500">현재 플랜</span>
                       <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md text-xs">{userProfile.plan_tier === 'free' ? '무료' : userProfile.plan_tier}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-sm text-gray-500">보유 크레딧</span>
                       <span className="font-bold text-brand-primary">{userProfile.credits?.toLocaleString() || 0} C</span>
                    </div>
                 </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm">정보를 불러오는 중...</div>
            )}
         </div>
      )}
    </div>
  );
}
