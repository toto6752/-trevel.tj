import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User as UserIcon, MessageSquare, Search, Phone, MoreVertical, CheckCheck, Loader2 } from 'lucide-react';
import { cn } from '../utils';
import { io, Socket } from 'socket.io-client';
import { api } from '../api';

interface ChatMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  property_id?: number;
  content: string;
  created_at: string;
  isMe?: boolean;
}

interface ChatPreview {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  property_id?: number;
  recipient_id: number;
}

export default function ChatTab() {
  const [activeChat, setActiveChat] = useState<ChatPreview | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mock Current User (In real app, get from Auth context)
  const currentUserId = 1; // Assuming Alexander has ID 1

  useEffect(() => {
    // 1. Initialize Socket
    socketRef.current = io();

    socketRef.current.on('connect', () => {
      console.log('Connected to chat server');
    });

    socketRef.current.on('receive_message', (msg: ChatMessage) => {
      setMessages(prev => {
        // Idempotent check
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, { ...msg, isMe: msg.sender_id === currentUserId }];
      });
    });

    // 2. Fetch Chat List
    const loadChats = async () => {
      try {
        // In a real app, this would be an API call to get distinct conversations
        // For now, we use the mock with real IDs
        setChats([
          { id: 1, name: 'Парвиз (Душанбе)', lastMessage: 'Конечно, заезд возможен в 14:00.', time: '12:45', unread: 1, online: true, recipient_id: 2, property_id: 1 },
          { id: 2, name: 'Гостиница "Олимп"', lastMessage: 'Добрый день!', time: 'Вчера', unread: 0, online: false, recipient_id: 3, property_id: 2 },
        ]);
      } catch (err) {
        console.error('Failed to load chats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (activeChat && socketRef.current) {
      // 3. Join Room on tab change
      socketRef.current.emit('join_room', {
        userId: currentUserId,
        recipientId: activeChat.recipient_id,
        propertyId: activeChat.property_id
      });

      // 4. Fetch Message History
      const loadHistory = async () => {
        try {
          const history = await api.getMessages(activeChat.recipient_id);
          setMessages(history.map((m: any) => ({
            ...m,
            isMe: m.sender_id === currentUserId
          })));
        } catch (err) {
          console.error('Failed to load history:', err);
        }
      };

      loadHistory();
    }
  }, [activeChat]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() || !activeChat || !socketRef.current) return;

    const messageData = {
      senderId: currentUserId,
      receiverId: activeChat.recipient_id,
      propertyId: activeChat.property_id,
      content: inputText
    };

    socketRef.current.emit('send_message', messageData);
    setInputText('');
  };

  return (
    <motion.div
      key="chat"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white rounded-[40px] shadow-sm border border-slate-200 h-[calc(100vh-250px)] overflow-hidden flex"
    >
      {/* Sidebar - Chat List */}
      <div className="w-1/3 border-r border-slate-100 flex flex-col">
        <div className="p-8 border-b border-slate-50">
          <h2 className="text-2xl font-black text-slate-900 mb-6">Сообщения</h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Поиск чатов..."
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-10 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="animate-spin text-slate-200" size={32} />
            </div>
          ) : (
            chats.map(chat => (
              <div 
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={cn(
                  "p-6 flex items-center gap-4 cursor-pointer transition-all border-l-4",
                  activeChat?.id === chat.id 
                    ? "bg-slate-50 border-emerald-600 shadow-inner" 
                    : "border-transparent hover:bg-slate-50/50"
                )}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold border border-slate-200 shadow-sm">
                    {chat.name.substring(0, 1)}
                  </div>
                  {chat.online && (
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-black text-slate-900 text-sm truncate">{chat.name}</h3>
                    <span className="text-[10px] text-slate-400 font-bold">{chat.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500 font-medium truncate pr-2">{chat.lastMessage}</p>
                    {chat.unread > 0 && (
                      <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-lg shadow-emerald-600/20">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col bg-slate-50/30">
        <AnimatePresence mode="wait">
          {activeChat ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col h-full"
            >
              {/* Chat Header */}
              <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                    {activeChat.name.substring(0, 1)}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm leading-tight">{activeChat.name}</h3>
                    <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">
                      {activeChat.online ? 'Онлайн' : 'Был недавно'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {messages.map(msg => (
                  <div 
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[70%]",
                      msg.isMe ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div className={cn(
                      "p-4 rounded-[24px] text-sm font-medium shadow-sm leading-relaxed",
                      msg.isMe 
                        ? "bg-slate-900 text-white rounded-tr-none shadow-xl shadow-slate-900/10" 
                        : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                    )}>
                      {msg.content}
                    </div>
                    <div className="mt-2 flex items-center gap-2 px-2">
                      <span className="text-[10px] text-slate-400 font-bold">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.isMe && <CheckCheck size={12} className="text-emerald-500" />}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-6 bg-white border-t border-slate-100">
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ваше сообщение..."
                    className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                  />
                  <button 
                    onClick={handleSend}
                    className="bg-emerald-600 text-white p-4 rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 active:scale-90 transition-all"
                  >
                    <Send size={24} />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
               <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 border border-slate-100 shadow-sm">
                 <MessageSquare size={40} className="text-slate-100" />
               </div>
               <h3 className="text-2xl font-black text-slate-900 mb-2">Выберите чат</h3>
               <p className="text-slate-500 max-w-xs font-medium">Чтобы начать общение, выберите переписку слева.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
