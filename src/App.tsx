/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  LayoutGrid, 
  MessageSquare,
  User as UserIcon,
  Heart,
  Menu,
  X,
  Star,
  LogOut,
  LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_PROPERTIES } from './data/mockData';
import { Property, City, PropertyType } from './types';
import AIAssistant from './components/AIAssistant';
import { cn, formatCurrency } from './utils';
import { api } from './api';

// Tab Components
import HomeTab from './components/HomeTab';
import SearchTab from './components/SearchTab';
import FavoritesTab from './components/FavoritesTab';
import ChatTab from './components/ChatTab';
import ProfileTab from './components/ProfileTab';

import ReviewSection from './components/ReviewSection';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'favorites' | 'chat' | 'profile'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | 'Все'>('Все');
  const [selectedType, setSelectedType] = useState<PropertyType | 'Все'>('Все');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<Property[]>([]);
  
  // Auth State
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    fetchProperties();
  }, [selectedCity, selectedType]);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProperties({ city: selectedCity, type: selectedType });
      setProperties(data.length > 0 ? data : MOCK_PROPERTIES);
    } catch (err) {
      setProperties(MOCK_PROPERTIES);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === 'Все' || p.city === selectedCity;
    const matchesType = selectedType === 'Все' || p.type === selectedType;
    return matchesSearch && matchesCity && matchesType;
  });

  const cities: (City | 'Все')[] = ['Все', 'Душанбе', 'Худжанд', 'Хорог', 'Пенджикент', 'Мургаб'];
  const types: (PropertyType | 'Все')[] = ['Все', 'квартира', 'дом', 'гостиница'];

  return (
    <div className="min-h-screen pb-20 bg-slate-50 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navbar */}
      <nav className="h-24 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-12">
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => setActiveTab('home')}
          >
            <div className="text-2xl font-black bg-emerald-700 text-white w-12 h-12 flex items-center justify-center rounded-2xl shadow-xl shadow-emerald-700/20 group-hover:scale-105 transition-transform">T</div>
            <span className="font-black text-2xl tracking-tighter text-slate-900">Travel-TJ</span>
          </div>
          
          <div className="hidden lg:flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            {[
              { id: 'home', label: 'Главная' },
              { id: 'search', label: 'Поиск' },
              { id: 'favorites', label: 'Закладки' },
              { id: 'chat', label: 'Чат' }
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id as any)} 
                className={cn(
                  "hover:text-emerald-700 transition-all relative py-2",
                  activeTab === item.id && "text-emerald-700"
                )}
              >
                {item.label}
                {activeTab === item.id && (
                  <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors">
            <Menu size={20} />
          </button>
          {token ? (
            <div className="flex items-center gap-4 pl-4 border-l border-slate-100">
              <div 
                onClick={() => setActiveTab('profile')}
                className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center font-black text-emerald-700 shadow-sm cursor-pointer hover:bg-emerald-200 transition-colors uppercase"
              >
                {user?.name?.substring(0, 2) || 'AM'}
              </div>
              <button 
                onClick={() => { localStorage.removeItem('token'); setToken(null); setUser(null); setActiveTab('home'); }}
                className="p-3 text-slate-300 hover:text-rose-500 transition-colors"
                title="Выйти"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-xs shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95"
            >
              <LogIn size={18} />
              <span>ВОЙТИ</span>
            </button>
          )}
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <HomeTab 
              setActiveTab={setActiveTab}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setSelectedProperty={setSelectedProperty}
              setIsAiOpen={setIsAiOpen}
            />
          )}

          {activeTab === 'search' && (
            <SearchTab 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              filteredProperties={filteredProperties}
              setSelectedProperty={setSelectedProperty}
              cities={cities}
              types={types}
            />
          )}

          {activeTab === 'favorites' && (
            <FavoritesTab 
              favorites={favorites} 
              setSelectedProperty={setSelectedProperty} 
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'chat' && (
            <ChatTab />
          )}

          {activeTab === 'profile' && (
            token ? (
              <ProfileTab user={user} onLogout={() => { setToken(null); setUser(null); }} />
            ) : (
              <motion.div
                key="auth"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-md mx-auto py-24"
              >
                <div className="bg-white p-12 rounded-[48px] shadow-sm border border-slate-200 text-center">
                  <h3 className="text-3xl font-black text-slate-900 mb-4">Добро пожаловать</h3>
                  <p className="text-slate-400 font-bold mb-10">Войдите, чтобы бронировать жилье и общаться с владельцами.</p>
                  
                  <div className="space-y-6 text-left">
                    <div>
                      <label className="text-[10px] uppercase font-black text-slate-400 mb-2 block tracking-widest pl-2">Электронная почта</label>
                      <input type="email" placeholder="name@example.com" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-black text-slate-400 mb-2 block tracking-widest pl-2">Пароль</label>
                      <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold" />
                    </div>
                    
                    <button 
                      onClick={() => {
                        const mockToken = 'mock-jwt';
                        localStorage.setItem('token', mockToken);
                        setToken(mockToken);
                        setUser({ name: 'Alexander' });
                        setActiveTab('home');
                      }}
                      className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
                    >
                      ВОЙТИ
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </main>

      {/* Property Details Modal */}
      <AnimatePresence>
        {selectedProperty && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProperty(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-white rounded-[48px] overflow-hidden shadow-2xl flex flex-col md:flex-row h-full max-h-[850px] border border-slate-200"
            >
              <button 
                onClick={() => setSelectedProperty(null)}
                className="absolute top-8 right-8 z-10 w-14 h-14 bg-white/80 backdrop-blur rounded-2xl flex items-center justify-center hover:bg-white transition-colors shadow-lg border border-slate-100"
              >
                <X size={24} />
              </button>

              <div className="md:w-1/2 h-64 md:h-auto overflow-hidden">
                <img src={selectedProperty.image} alt={selectedProperty.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>

              <div className="md:w-1/2 p-10 md:p-16 overflow-y-auto custom-scrollbar flex flex-col">
                <div className="mb-10">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="bg-emerald-50 text-emerald-700 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">{selectedProperty.type}</span>
                    <div className="flex items-center gap-1 text-amber-500 font-black">
                      <Star size={18} fill="currentColor" />
                      <span>{selectedProperty.rating}</span>
                    </div>
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 mb-6 leading-tight tracking-tighter">{selectedProperty.title}</h2>
                  <div className="flex items-center gap-2 text-slate-500 font-bold">
                    <MapPin size={20} className="text-emerald-600" />
                    <span>{selectedProperty.city}, Таджикистан</span>
                  </div>
                </div>

                <div className="space-y-10 flex-1">
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-4">Описание объекта</h4>
                    <p className="text-slate-600 leading-relaxed text-lg font-medium">{selectedProperty.description}</p>
                  </div>

                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-4">Удобства</h4>
                    <div className="flex flex-wrap gap-3">
                      {selectedProperty.amenities.map(a => (
                        <span key={a} className="bg-slate-50 px-5 py-3 rounded-2xl text-xs font-bold text-slate-700 border border-slate-100">{a}</span>
                      ))}
                    </div>
                  </div>

                  <ReviewSection 
                    propertyId={selectedProperty.id} 
                    isAuthenticated={!!token}
                    onReviewPosted={async () => {
                      const updated = await api.getProperty(selectedProperty.id);
                      setSelectedProperty(updated);
                      fetchProperties(); // Refresh main list too
                    }}
                  />
                </div>

                <div className="mt-10 pt-10 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">В сутки</p>
                    <p className="text-4xl font-black text-slate-900">{formatCurrency(selectedProperty.price)}</p>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        const isFav = favorites.some(f => f.id === selectedProperty.id);
                        if (isFav) setFavorites(favorites.filter(f => f.id !== selectedProperty.id));
                        else setFavorites([...favorites, selectedProperty]);
                      }}
                      className={cn(
                        "w-16 h-16 rounded-[24px] border-2 border-slate-100 flex items-center justify-center transition-all shadow-sm",
                        favorites.some(f => f.id === selectedProperty.id) ? "bg-rose-50 border-rose-100 text-rose-500" : "bg-white text-slate-300 hover:bg-slate-50"
                      )}
                    >
                      <Heart size={28} fill={favorites.some(f => f.id === selectedProperty.id) ? "currentColor" : "none"} />
                    </button>
                    <button className="bg-emerald-600 text-white px-10 py-5 rounded-[24px] font-black hover:bg-emerald-700 transition-all flex items-center gap-3 shadow-xl shadow-emerald-600/30">
                      <MessageSquare size={24} />
                      Бронировать
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-3xl border-t border-slate-100 px-8 py-5 lg:hidden">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          {[
            { id: 'home', icon: LayoutGrid },
            { id: 'search', icon: Search },
            { id: 'favorites', icon: Heart },
            { id: 'chat', icon: MessageSquare },
            { id: 'profile', icon: UserIcon },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "p-4 rounded-2xl transition-all relative",
                activeTab === tab.id ? "bg-emerald-700 text-white shadow-xl" : "text-slate-300 hover:text-slate-600"
              )}
            >
              <tab.icon size={24} />
              {tab.id === 'chat' && (
                <span className="absolute top-2 right-2 w-3 h-3 bg-rose-500 border-2 border-white rounded-full" />
              )}
            </button>
          ))}
        </div>
      </nav>

      <AIAssistant isOpen={isAiOpen} setIsOpen={setIsAiOpen} />
    </div>
  );
}
