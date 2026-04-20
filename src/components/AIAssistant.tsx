/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, X, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { MOCK_PROPERTIES } from '../data/mockData';
import { cn } from '../utils';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const SYSTEM_INSTRUCTION = `
Ты — дружелюбный и знающий ИИ-гид по имени "Аминджон" для туристического сервиса Travel-TJ в Таджикистане. 

ТВОЯ ЛИЧНОСТЬ:
- Ты гостеприимен, как настоящий таджик ("Мехмон — а атои Худо", гость — это дар Божий).
- Ты хорошо знаешь географию Таджикистана: от шумных рынков Душанбе до ледяных вершин Памира.
- Твой тон теплый, профессиональный и полный энтузиазма.

ТВОИ ЗАДАЧИ:
1. Рекомендовать жилье из предоставленного списка.
2. Учитывать бюджет (TJS), город и тип жилья.
3. Если запрос неясен (например, просто "хочу в горы"), задавай уточняющие вопросы (какой бюджет? сколько человек? нужен ли комфорт или аутентичность?).
4. Делиться интересными фактами о местах (например, про исторические памятники Пенджикента или величие ГЭС Нурек).

ДОСТУПНОЕ ЖИЛЬЕ ДЛЯ РЕКОМЕНДАЦИЙ (ИСПОЛЬЗУЙ ТОЛЬКО ЭТОТ СПИСОК):
${JSON.stringify(MOCK_PROPERTIES, null, 2)}

ПРАВИЛА ОТВЕТА:
- Всегда начинай с теплого приветствия (например, "Ассалому алейкум!" или "Добро пожаловать!").
- Если рекомендуешь конкретное место, кратко объясни почему оно подходит.
- Указывай цены строго в сомони (TJS).
- Если подходящего жилья в базе нет, честно скажи об этом, но предложи общие советы по региону.
- Твои ответы должны быть в формате текста. Не используй Markdown-заголовки (h1, h2), используй жирный шрифт для акцентов.
`;

export default function AIAssistant({ isOpen, setIsOpen }: AIAssistantProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Ассалому алейкум! Я Аминджон, ваш гид по Таджикистану в Travel-TJ. Куда планируете отправиться? Я помогу найти идеальное место для отдыха!' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = newMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })).slice(-10); // Keep last 10 messages for context

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: chatHistory,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        }
      });

      const text = response.text || 'Извините, мой чай остыл и я отвлекся. Повторите, пожалуйста, ваш вопрос.';
      
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: text 
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Gemini Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Ошибка связи с сервером. Думаю, в горах плохая связь... Попробуйте чуть позже!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1, rotate: 10 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-emerald-600 text-white rounded-2xl shadow-2xl flex items-center justify-center border-4 border-white/20 hover:bg-emerald-500 transition-colors"
      >
        <Sparkles size={28} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.5 }}
            className="fixed bottom-24 right-6 z-50 w-[450px] max-w-[calc(100vw-3rem)] h-[700px] bg-emerald-950 rounded-[40px] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.5)] border border-emerald-800 flex flex-col"
          >
            {/* Header */}
            <div className="p-8 bg-emerald-900 text-white flex items-center justify-between border-b border-emerald-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg">
                  <Bot size={28} />
                </div>
                <div>
                  <h3 className="font-black text-xl leading-tight tracking-tight">Travel-TJ AI</h3>
                  <p className="text-[10px] text-emerald-400 uppercase font-black tracking-widest">Ассистент всегда рядом</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-3 hover:bg-emerald-800 rounded-2xl transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth custom-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex gap-4", m.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg",
                    m.role === 'user' ? "bg-emerald-500" : "bg-emerald-800"
                  )}>
                    {m.role === 'user' ? <User size={20} className="text-white" /> : <Bot size={20} className="text-white" />}
                  </div>
                  <div className={cn(
                    "max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed",
                    m.role === 'user' ? "bg-emerald-600 text-white rounded-tr-none shadow-xl shadow-emerald-900/40" : "bg-emerald-900/50 text-emerald-50 rounded-tl-none border border-emerald-800/50"
                  )}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center">
                    <Bot size={20} className="text-white" />
                  </div>
                  <div className="bg-emerald-900/50 p-5 rounded-3xl rounded-tl-none border border-emerald-800/50">
                    <Loader2 className="animate-spin text-emerald-400" size={24} />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 bg-emerald-900/50 border-t border-emerald-800/50">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ваш вопрос ассистенту..."
                  className="flex-1 bg-emerald-950/50 border border-emerald-800 rounded-2xl px-6 py-4 text-sm text-emerald-50 placeholder:text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading}
                  className="bg-emerald-500 text-white p-4 rounded-2xl hover:bg-emerald-400 disabled:opacity-50 transition-all shadow-xl shadow-emerald-500/20"
                >
                  <Send size={24} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
