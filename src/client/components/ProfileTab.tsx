import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User as UserIcon, Settings, LogOut, ChevronRight, 
  MapPin, Calendar, Heart, History, Compass, 
  Trash2, Edit3, Plus, ExternalLink 
} from 'lucide-react';
import { api } from '../api';
import { Tour } from '../types';
import { cn, formatCurrency } from '../utils';
import Button from './ui/Button';

interface ProfileTabProps {
  user: any;
  onLogout: () => void;
  setSelectedTour: (tour: Tour) => void;
}

export default function ProfileTab({ user, onLogout, setSelectedTour }: ProfileTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'favorites' | 'history' | 'my-tours'>('info');
  const [favorites, setFavorites] = useState<Tour[]>([]);
  const [history, setHistory] = useState<Tour[]>([]);
  const [myTours, setMyTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (activeSubTab === 'favorites') fetchFavorites();
    if (activeSubTab === 'history') fetchHistory();
    if (activeSubTab === 'my-tours') fetchMyTours();
  }, [activeSubTab]);

  const fetchFavorites = async () => {
    if (!token) return;
    setIsLoading(true);
    const data = await api.getFavorites(token);
    setFavorites(data || []);
    setIsLoading(false);
  };

  const fetchHistory = async () => {
    if (!token) return;
    setIsLoading(true);
    const data = await api.getHistory(token);
    setHistory(data || []);
    setIsLoading(false);
  };

  const fetchMyTours = async () => {
    if (!token) return;
    setIsLoading(true);
    const data = await api.getMyTours(token);
    setMyTours(data || []);
    setIsLoading(false);
  };

  const handleDeleteTour = async (id: number) => {
    if (!token) return;
    if (!confirm('Вы уверены, что хотите удалить этот тур?')) return;
    
    await api.deleteTour(id, token);
    fetchMyTours();
  };

  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto space-y-12 pb-24"
    >
      <div className="grid grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="col-span-12 lg:col-span-3 space-y-6">
          {/* User Info Card */}
          <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-emerald-100 rounded-[30px] flex items-center justify-center text-emerald-700 text-3xl font-black shadow-xl shadow-emerald-500/10 border-4 border-white">
                {user?.name?.substring(0, 2).toUpperCase()}
              </div>
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-1">{user?.name}</h2>
            <p className="text-slate-400 font-bold text-xs mb-4">{user?.email}</p>
            <span className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6",
              user?.role === 'creator' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
            )}>
              {user?.role === 'creator' ? 'Автор туров' : 'Турист'}
            </span>

            <div className="w-full space-y-2">
              <button 
                onClick={() => setActiveSubTab('info')}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-left transition-all",
                  activeSubTab === 'info' ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "text-slate-500 hover:bg-slate-50"
                )}
              >
                <UserIcon size={18} />
                Профиль
              </button>
              <button 
                onClick={() => setActiveSubTab('favorites')}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-left transition-all",
                  activeSubTab === 'favorites' ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "text-slate-500 hover:bg-slate-50"
                )}
              >
                <Heart size={18} />
                Избранное
              </button>
              <button 
                onClick={() => setActiveSubTab('history')}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-left transition-all",
                  activeSubTab === 'history' ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "text-slate-500 hover:bg-slate-50"
                )}
              >
                <History size={18} />
                История
              </button>
              {user?.role === 'creator' && (
                <button 
                  onClick={() => setActiveSubTab('my-tours')}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-left transition-all",
                    activeSubTab === 'my-tours' ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <Compass size={18} />
                  Мои туры
                </button>
              )}
            </div>

            <button 
              onClick={onLogout}
              className="mt-8 text-slate-400 font-black flex items-center gap-2 hover:text-rose-500 transition-colors uppercase tracking-widest text-[10px]"
            >
              <LogOut size={16} />
              Выход
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="col-span-12 lg:col-span-9">
          <div className="bg-white rounded-[48px] p-10 md:p-12 border border-slate-200 shadow-sm min-h-[600px]">
            {activeSubTab === 'info' && (
              <div className="space-y-10">
                <div className="flex justify-between items-center">
                  <h3 className="text-3xl font-black text-slate-900">Персональные данные</h3>
                  <button className="text-emerald-600 font-black text-xs uppercase tracking-widest hover:underline">Изменить</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Имя пользователя</label>
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-700">{user?.name}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email адрес</label>
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-700">{user?.email}</div>
                  </div>
                  {user?.role === 'creator' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Номер телефона</label>
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-700">{user?.phone || 'Не указан'}</div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-700">{user?.whatsapp || 'Не указан'}</div>
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-10 border-t border-slate-100">
                  <h4 className="font-black text-slate-900 mb-6">Безопасность</h4>
                  <button className="flex items-center justify-between w-full p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-emerald-200 group transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors shadow-sm">
                        <Settings size={22} />
                      </div>
                      <div className="text-left">
                        <p className="font-black text-slate-900">Изменить пароль</p>
                        <p className="text-xs font-bold text-slate-400">Рекомендуется менять раз в 3 месяца</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </button>
                </div>
              </div>
            )}

            {activeSubTab === 'favorites' && (
              <div className="space-y-8">
                <h3 className="text-3xl font-black text-slate-900">Избранные туры</h3>
                {isLoading ? (
                  <div className="flex justify-center py-20"><Plus className="animate-spin text-emerald-600" /></div>
                ) : favorites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {favorites.map(tour => (
                      <SmallTourCard key={tour.id} tour={tour} onClick={() => setSelectedTour(tour)} />
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={<Heart />} title="Нет избранного" description="Ваши любимые маршруты появятся здесь." />
                )}
              </div>
            )}

            {activeSubTab === 'history' && (
              <div className="space-y-8">
                <h3 className="text-3xl font-black text-slate-900">Вы недавно смотрели</h3>
                {isLoading ? (
                   <div className="flex justify-center py-20"><Plus className="animate-spin text-emerald-600" /></div>
                ) : history.length > 0 ? (
                  <div className="space-y-4">
                    {history.map(tour => (
                      <HistoryRow key={tour.id} tour={tour} onOpen={() => setSelectedTour(tour)} />
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={<History />} title="История пуста" description="Мы запомним туры, которые вас заинтересовали." />
                )}
              </div>
            )}

            {activeSubTab === 'my-tours' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-3xl font-black text-slate-900">Размещенные туры</h3>
                  <Button size="sm" icon={<Plus size={18} />} className="rounded-2xl">Добавить тур</Button>
                </div>
                {isLoading ? (
                   <div className="flex justify-center py-20"><Plus className="animate-spin text-emerald-600" /></div>
                ) : myTours.length > 0 ? (
                  <div className="space-y-4">
                    {myTours.map(tour => (
                      <AdminTourRow 
                        key={tour.id} 
                        tour={tour} 
                        onDelete={() => handleDeleteTour(tour.id)} 
                        onEdit={() => setSelectedTour(tour)} // TODO: open edit form
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={<Compass />} title="У вас нет туров" description="Станьте автором и начните зарабатывать на приключениях." />
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </motion.div>
  );
}

function SmallTourCard({ tour, onClick }: { tour: Tour, onClick: () => void }) {
  return (
    <div onClick={onClick} className="bg-slate-50 p-4 rounded-[32px] border border-slate-100 hover:border-rose-200 transition-all group cursor-pointer flex gap-5">
      <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
        <img src={tour.images?.[0] || 'https://picsum.photos/seed/travel/300/300'} className="w-full h-full object-cover group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
      </div>
      <div>
        <h4 className="font-black text-slate-900 group-hover:text-emerald-700 transition-colors mb-1">{tour.title}</h4>
        <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-4">
          <MapPin size={10} className="text-emerald-500" /> {tour.city}
        </div>
        <div className="text-lg font-black text-slate-900">{formatCurrency(tour.price)}</div>
      </div>
    </div>
  );
}

function HistoryRow({ tour, onOpen }: { tour: Tour, onOpen: () => void }) {
  return (
    <div className="p-4 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between group hover:bg-white hover:border-emerald-200 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl overflow-hidden border border-white">
          <img src={tour.images?.[0] || 'https://picsum.photos/seed/travel/100/100'} className="w-full h-full object-cover" />
        </div>
        <div>
          <h4 className="font-black text-slate-900">{tour.title}</h4>
          <p className="text-[10px] font-bold text-slate-400">{tour.city} • {tour.duration}</p>
        </div>
      </div>
      <button onClick={onOpen} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all">
        <ExternalLink size={18} />
      </button>
    </div>
  );
}

function AdminTourRow({ tour, onDelete, onEdit }: { tour: Tour, onDelete: () => void, onEdit: () => void }) {
  return (
    <div className="p-5 bg-slate-50 border border-slate-100 rounded-[32px] flex items-center justify-between group hover:border-emerald-200 transition-all">
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white shadow-sm">
          <img src={tour.images?.[0] || 'https://picsum.photos/seed/travel/200/200'} className="w-full h-full object-cover" />
        </div>
        <div>
          <h4 className="font-black text-slate-900 text-lg mb-1">{tour.title}</h4>
          <div className="flex gap-4">
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">{tour.city}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest self-center">{tour.duration}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onEdit} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all border border-slate-100">
          <Edit3 size={18} />
        </button>
        <button onClick={onDelete} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white transition-all border border-slate-100">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="py-20 text-center">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
        {icon}
      </div>
      <h4 className="text-xl font-black text-slate-900 mb-2">{title}</h4>
      <p className="text-slate-500 font-medium max-w-xs mx-auto">{description}</p>
    </div>
  );
}
