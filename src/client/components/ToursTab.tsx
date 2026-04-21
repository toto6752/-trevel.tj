import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Compass, Plus, X, Image as ImageIcon, Search, SlidersHorizontal } from 'lucide-react';
import { Tour } from '../types';
import { api } from '../api';
import TourCard from './property/TourCard';
import Button from './ui/Button';
import Skeleton from './ui/Skeleton';

interface ToursTabProps {
  setSelectedTour: (t: Tour) => void;
  canCreate: boolean;
  favoriteTourIds?: number[];
  onToggleFavorite?: (e: React.MouseEvent, tour: Tour) => void;
}

export default function ToursTab({ setSelectedTour, canCreate, favoriteTourIds = [], onToggleFavorite }: ToursTabProps) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Все');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');

  const [newTour, setNewTour] = useState({
    title: '',
    description: '',
    city: 'Душанбе',
    price: '',
    duration: '',
    images: '',
    contacts: ''
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTours();
    }, 400); // Debounce search
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCity, maxPrice]);

  const fetchTours = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTours({ 
        q: searchQuery, 
        city: selectedCity, 
        maxPrice: maxPrice || undefined 
      });
      setTours(data);
    } catch (err) {
      console.error('Failed to fetch tours', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTour = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const tourData = {
        ...newTour,
        price: parseFloat(newTour.price),
        images: newTour.images ? newTour.images.split(',').map(i => i.trim()) : []
      };
      
      const res = await api.createTour(tourData, token);
      if (res.error) {
        alert(res.error);
        return;
      }
      
      setShowAddForm(false);
      setNewTour({
        title: '',
        description: '',
        city: 'Душанбе',
        price: '',
        duration: '',
        images: '',
        contacts: ''
      });
      fetchTours();
    } catch (err) {
      console.error('Add tour error', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-12 pb-12"
    >
      <div className="flex items-end justify-between">
        <div>
           <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Незабываемые туры</h2>
           <p className="text-slate-500 font-medium">Исследуйте Таджикистан с профессиональными гидами.</p>
        </div>
        {canCreate && (
          <Button 
            onClick={() => setShowAddForm(true)}
            icon={<Plus size={20} />}
          >
            Добавить тур
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-[32px] p-4 md:p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-center">
          {/* Search */}
          <div className="md:col-span-4 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Поиск тура (напр. горы, 3 дня...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
            />
          </div>

          {/* City Filter */}
          <div className="md:col-span-3">
            <select 
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-700 outline-none focus:bg-white transition-all cursor-pointer"
            >
              <option value="Все">Все направления</option>
              {['Душанбе', 'Худжанд', 'Хорог', 'Пенджикент', 'Мургаб'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Price Filter */}
          <div className="md:col-span-2 relative">
            <SlidersHorizontal className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="number"
              placeholder="Цена до"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-bold text-slate-700 outline-none focus:bg-white transition-all text-sm"
            />
          </div>

          {/* Duration Filter */}
          <div className="md:col-span-2">
            <select 
              value={searchQuery.includes('день') || searchQuery.includes('дня') ? searchQuery : ''}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-700 outline-none focus:bg-white transition-all cursor-pointer text-sm"
            >
              <option value="">Любая длит.</option>
              <option value="1 день">1 день</option>
              <option value="3 дня">3 дня</option>
              <option value="5 дней">5 дней</option>
              <option value="7 дней">Неделя</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="md:col-span-1 flex justify-center">
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedCity('Все');
                setMaxPrice('');
              }}
              className="p-4 text-slate-400 hover:text-emerald-600 transition-colors"
              title="Сбросить фильтры"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-[40px] p-4 border border-slate-100 space-y-4">
              <Skeleton className="h-64 w-full rounded-[32px]" />
              <div className="p-4 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between pt-4">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-10 w-10 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : tours.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map(t => (
            <TourCard 
              key={t.id} 
              tour={t} 
              onClick={() => setSelectedTour(t)} 
              isFavorite={favoriteTourIds.includes(t.id)}
              onToggleFavorite={onToggleFavorite ? (e) => onToggleFavorite(e, t) : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[48px] py-32 text-center border border-slate-200 shadow-sm">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-100">
            <Compass size={40} className="text-slate-200" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-4">Туров пока нет</h3>
          <p className="text-slate-500 max-w-sm mx-auto font-medium">Будьте первым, кто добавит увлекательный маршрут по горам Таджикистана.</p>
        </div>
      )}

      {/* Add Tour Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            onClick={() => setShowAddForm(false)} 
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-2xl bg-white rounded-[40px] p-10 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar border border-slate-200"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-900">Новый тур</h3>
              <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X/></button>
            </div>
            
            <form onSubmit={handleAddTour} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] uppercase font-black text-slate-400 mb-2 block tracking-widest pl-2">Название</label>
                  <input required value={newTour.title} onChange={e => setNewTour({...newTour, title: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-black text-slate-400 mb-2 block tracking-widest pl-2">Город</label>
                  <select value={newTour.city} onChange={e => setNewTour({...newTour, city: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold">
                    {['Душанбе', 'Худжанд', 'Хорог', 'Пенджикент', 'Мургаб'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-[10px] uppercase font-black text-slate-400 mb-2 block tracking-widest pl-2">Описание</label>
                <textarea required rows={4} value={newTour.description} onChange={e => setNewTour({...newTour, description: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] uppercase font-black text-slate-400 mb-2 block tracking-widest pl-2">Цена (TJS)</label>
                  <input required type="number" value={newTour.price} onChange={e => setNewTour({...newTour, price: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-black text-slate-400 mb-2 block tracking-widest pl-2">Длительность</label>
                  <input placeholder="напр. 3 дня" value={newTour.duration} onChange={e => setNewTour({...newTour, duration: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold" />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-slate-400 mb-2 block tracking-widest pl-2">Изображения (URL через запятую)</label>
                <div className="relative">
                  <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input value={newTour.images} onChange={e => setNewTour({...newTour, images: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-bold" placeholder="https://..." />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-slate-400 mb-2 block tracking-widest pl-2">Контакты (WhatsApp / Тел)</label>
                <input value={newTour.contacts} onChange={e => setNewTour({...newTour, contacts: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold" placeholder="+992..." />
              </div>

              <Button type="submit" className="w-full" size="lg">Опубликовать тур</Button>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
