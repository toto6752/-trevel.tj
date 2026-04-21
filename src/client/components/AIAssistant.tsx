/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, X, Loader2, Sparkles, MessageCircle, Map, DollarSign, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { api } from '../api';
import { cn } from '../utils';

// Client-side AI instance as per gemini-api skill
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const QUICK_ACTIONS = [
  { id: 'pick_tour', label: 'Подобрать тур', icon: Map, prompt: 'Привет! Помоги мне подобрать тур по Таджикистану.' }
];

export default function AIAssistant({ isOpen, setIsOpen }: AIAssistantProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Ассалому алейкум! Я Аминджон, ваш ИИ-гид. Готов спланировать ваше идеальное путешествие по Таджикистану. О чем хотите узнать?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch context data from backend once
    const fetchContext = async () => {
      try {
        const data = await api.getAiContext();
        if (data && typeof data === 'object') {
          setContext(data);
        }
      } catch (err) {
        console.error('Failed to fetch AI context in AIAssistant:', err);
      }
    };
    fetchContext();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSend = async (customInput?: string) => {
    const textToSend = customInput || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const systemInstruction = `
Ты — дружелюбный и знающий ИИ-гид по имени "Аминджон" для туристического сервиса Travel-TJ в Таджикистане. 

ТВОЯ ЛИЧНОСТЬ:
- Ты гостеприимен, как настоящий таджик ("Мехмон — а атои Худо", гость — это дар Божий).
- Ты хорошо знаешь географию Таджикистана.
- Твой тон теплый, профессиональный и полный энтузиазма.

ТВОИ ЗАДАЧИ:
1. Отвечать на вопросы о путешествиях по Таджикистану.
2. Рекомендовать туры и жилье из базы данных сайта.
3. Помогать выбрать направление.

ДАННЫЕ С САЙТА (ИСПОЛЬЗУЙ ДЛЯ РЕКОМЕНДАЦИЙ):
${context ? JSON.stringify(context, null, 2) : 'Данные загружаются...'}

ПРАВИЛА ОТВЕТА:
- Всегда начинай с теплого приветствия (например, "Ассалому алейкум!").
- Если рекомендуешь конкретное место, кратко объясни почему оно подходит.
- Указывай цены в сомони (TJS).
- Используй жирный шрифт для акцентов. Не используй Markdown-заголовки.
`;

      const chatHistory = newMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })).slice(-10);

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: chatHistory,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });
      
      const text = response.text || 'Извините, я не смог сгенерировать ответ.';
      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Рахмат за терпение! Кажется, у меня проблемы со связью. Повторите ваш вопрос чуть позже.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center border-4 border-white/20 hover:bg-emerald-500 transition-colors group"
      >
        <Sparkles size={28} className="group-hover:rotate-12 transition-transform" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-24 right-6 z-50 w-[420px] max-w-[calc(100vw-3rem)] h-[650px] bg-white rounded-[32px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.3)] border border-slate-200 flex flex-col"
          >
            {/* Header */}
            <div className="px-8 py-6 bg-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Bot size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-black text-lg leading-tight">Аминджон AI</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-emerald-200 font-bold uppercase tracking-widest">Онлайн</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 hover:bg-emerald-800/50 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 custom-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex gap-3", m.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white shadow-sm",
                    m.role === 'user' ? "bg-emerald-600" : "bg-slate-800"
                  )}>
                    {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={cn(
                    "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                    m.role === 'user' 
                      ? "bg-emerald-600 text-white rounded-tr-none" 
                      : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                  )}>
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white">
                    <Bot size={16} />
                  </div>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100">
                    <Loader2 className="animate-spin text-emerald-600" size={18} />
                  </div>
                </div>
              )}
            </div>

            {/* Footer / Input Area */}
            <div className="p-6 bg-white border-t border-slate-100">
              {/* Quick Actions */}
              {messages.length === 1 && !isLoading && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {QUICK_ACTIONS.map(action => (
                    <button
                      key={action.id}
                      onClick={() => handleSend(action.prompt)}
                      className="flex items-center gap-2 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-bold text-xs py-2 px-4 rounded-xl border border-slate-200 hover:border-emerald-200 transition-all group"
                    >
                      <action.icon size={14} className="text-slate-400 group-hover:text-emerald-500" />
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="relative">
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Задайте вопрос..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-6 pr-14 text-sm font-medium outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all resize-none overflow-hidden max-h-32"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-600 text-white p-2.5 rounded-xl hover:bg-emerald-500 disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-[9px] text-center text-slate-400 mt-4 font-bold uppercase tracking-widest opacity-60">
                ИИ может ошибаться. Перепроверяйте детали тура.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
