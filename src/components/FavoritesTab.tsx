import { motion } from 'motion/react';
import { Heart, Search } from 'lucide-react';
import HousingCard from './HousingCard';
import { Property } from '../types';

interface FavoritesTabProps {
  favorites: Property[];
  setSelectedProperty: (p: Property) => void;
  setActiveTab: (tab: any) => void;
}

export default function FavoritesTab({ favorites, setSelectedProperty, setActiveTab }: FavoritesTabProps) {
  return (
    <motion.div
      key="favorites"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-12 pb-12"
    >
      <div className="flex items-end justify-between">
        <div>
           <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Избранное</h2>
           <p className="text-slate-500 font-medium">Ваши сохраненные места для будущих путешествий.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <Heart size={20} className="text-rose-500 fill-rose-500" />
          <span className="font-black text-slate-900">{favorites.length} объектов</span>
        </div>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {favorites.map(p => (
            <HousingCard key={p.id} property={p} onClick={() => setSelectedProperty(p)} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[48px] py-32 text-center border border-slate-200 shadow-sm">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-100">
            <Heart size={40} className="text-slate-200" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-4">У вас пока нет избранного</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-10 leading-relaxed font-medium">
            Нажимайте на сердечко на карточках жилья, чтобы сохранить их здесь и вернуться к ним позже.
          </p>
          <button 
            onClick={() => setActiveTab('search')}
            className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-2 mx-auto"
          >
            <Search size={20} />
            Найти жилье
          </button>
        </div>
      )}
    </motion.div>
  );
}
