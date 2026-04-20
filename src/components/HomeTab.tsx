import { motion } from 'motion/react';
import { Search, Compass, MessageSquare, Star, LayoutGrid, MapPin } from 'lucide-react';
import { MOCK_PROPERTIES } from '../data/mockData';
import { formatCurrency } from '../utils';

interface HomeProps {
  setActiveTab: (tab: any) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setSelectedProperty: (p: any) => void;
  setIsAiOpen: (open: boolean) => void;
}

export default function Home({ 
  setActiveTab, 
  searchQuery, 
  setSearchQuery, 
  setSelectedProperty,
  setIsAiOpen
}: HomeProps) {
  return (
    <motion.div
      key="home"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="grid grid-cols-12 gap-4 lg:grid-rows-6"
    >
      {/* Search & Filters Hero - Bento Column 1-8 */}
      <section className="col-span-12 lg:col-span-8 lg:row-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 p-10 flex flex-col justify-center gap-6">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Открой сердце<br/>Центральной Азии</h1>
        
        <div className="flex flex-col md:flex-row gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="flex-1 bg-white rounded-xl p-4 flex items-center gap-3 border border-slate-100 shadow-sm">
            <Search className="text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Куда едем? Душанбе, Худжанд, Памир..." 
              className="bg-transparent outline-none text-sm w-full font-bold text-slate-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setActiveTab('search')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-xl font-black transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
          >
            Поиск
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          {['Отели', 'Квартиры', 'Горные домики', 'Гостевые дома'].map((tag) => (
            <span key={tag} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black border border-emerald-100 uppercase tracking-widest cursor-default hover:bg-emerald-100 transition-colors">
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* AI Assistant Info - Bento Column 9-12 */}
      <section className="col-span-12 lg:col-span-4 lg:row-span-4 bg-emerald-900 rounded-[40px] shadow-2xl border border-emerald-800 p-10 flex flex-col gap-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-500 rounded-[20px] flex items-center justify-center shadow-2xl shadow-emerald-500/40">
            <Compass size={28} className="text-white" />
          </div>
          <div>
            <div className="font-black text-xl">AI Консьерж</div>
            <div className="text-xs text-emerald-300 font-bold tracking-widest uppercase">В сети • 24/7</div>
          </div>
        </div>
        
        <div className="flex-1 bg-emerald-800/30 backdrop-blur-xl rounded-[32px] p-8 text-sm leading-relaxed border border-emerald-700/50 shadow-inner">
           <p className="mb-6 italic text-emerald-100 font-medium">"Салам! Я заметил, вы интересуетесь Душанбе. Хотите варианты рядом с парком Рудаки или с видом на горы?"</p>
           <div className="p-4 bg-emerald-700/40 rounded-2xl border border-emerald-600/30 text-emerald-50 text-xs font-bold">
              Покажи варианты с видом на горы до 500 сомони.
           </div>
        </div>

        <button 
          onClick={() => setIsAiOpen(true)}
          className="w-full bg-white text-emerald-900 font-black py-5 rounded-[24px] transition-all shadow-2xl hover:bg-emerald-50 active:scale-95 flex items-center justify-center gap-3"
        >
          <MessageSquare size={20} />
          Открыть чат
        </button>
      </section>

      {/* Main Search Results Snippet - Bento Column 1-5 */}
      <section className="col-span-12 lg:col-span-5 lg:row-span-4 bg-white rounded-3xl shadow-sm border border-slate-200 p-8 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-bold text-2xl text-slate-800">Лучшее в Таджикистане</h2>
          <button onClick={() => setActiveTab('search')} className="text-emerald-600 text-sm font-bold hover:underline">См. все</button>
        </div>
        <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {MOCK_PROPERTIES.slice(0, 4).map(p => (
            <div 
              key={p.id}
              onClick={() => setSelectedProperty(p)}
              className="flex gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-slate-100 group"
            >
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                <img src={p.image} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tighter">{p.city}</span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    {p.rating} <Star size={10} fill="currentColor" />
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{p.title}</h3>
                <p className="text-[10px] text-slate-500 line-clamp-1 mb-2">{p.description}</p>
                <div className="text-sm font-black text-slate-900">{formatCurrency(p.price)} <span className="text-slate-400 font-normal">/ ночь</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Bento Block */}
      <section className="col-span-12 lg:col-span-3 lg:row-span-2 bg-amber-50 rounded-3xl shadow-sm border border-amber-100 p-8 flex flex-col justify-between">
        <h3 className="text-xs font-black text-amber-800 uppercase tracking-widest opacity-60">Твои достижения</h3>
        <div className="flex items-center justify-around">
          <div className="text-center">
            <div className="text-3xl font-black text-amber-900 leading-none">12</div>
            <div className="text-[10px] uppercase font-black text-amber-700 mt-1">Поездок</div>
          </div>
          <div className="h-10 w-px bg-amber-200" />
          <div className="text-center">
            <div className="text-3xl font-black text-amber-900 leading-none">4.8</div>
            <div className="text-[10px] uppercase font-black text-amber-700 mt-1">Рейтинг</div>
          </div>
        </div>
        <div className="text-[10px] text-amber-800/80 italic border-t border-amber-200/50 pt-4">
          "Это было лучшее путешествие в Фанские горы!"
        </div>
      </section>

      {/* Map/Interactive Route - Bento Column 8-12 */}
      <section className="col-span-12 lg:col-span-4 lg:row-span-2 bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 relative overflow-hidden group">
         <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_#475569,_#1e293b)]" />
         <div className="relative p-8 h-full flex flex-col justify-end">
            <div className="text-white font-bold text-xl mb-1 flex items-center gap-2">
              <MapPin size={24} className="text-emerald-400" />
              Памирский тракт
            </div>
            <p className="text-slate-400 text-xs mb-4 max-w-[200px]">Исследуй легендарную дорогу M41 на интерактивной карте.</p>
            <button className="bg-white text-slate-900 text-xs font-black py-3 px-6 rounded-xl self-start group-hover:bg-emerald-400 group-hover:text-white transition-all shadow-lg active:scale-95">
              Открыть карту
            </button>
         </div>
      </section>
    </motion.div>
  );
}
