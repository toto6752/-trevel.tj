import { motion } from 'motion/react';
import { Heart, Search, Compass } from 'lucide-react';
import PropertyCard from './property/PropertyCard';
import TourCard from './property/TourCard';
import Button from './ui/Button';
import { Property, Tour } from '../types';

interface FavoritesTabProps {
  favorites: Property[];
  favoriteTours: Tour[];
  setSelectedProperty: (p: Property) => void;
  setSelectedTour: (t: Tour) => void;
  onToggleFavoriteTour: (e: React.MouseEvent, tour: Tour) => void;
  setActiveTab: (tab: any) => void;
}

export default function FavoritesTab({ 
  favorites, 
  favoriteTours, 
  setSelectedProperty, 
  setSelectedTour,
  onToggleFavoriteTour,
  setActiveTab 
}: FavoritesTabProps) {
  return (
    <motion.div
      key="favorites"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-16 pb-12"
    >
      <div className="flex items-end justify-between">
        <div>
           <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Избранное</h2>
           <p className="text-slate-500 font-medium">Ваши сохраненные места и маршруты для будущих путешествий.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <Heart size={20} className="text-rose-500 fill-rose-500" />
          <span className="font-black text-slate-900">{favorites.length + favoriteTours.length} сохраненных</span>
        </div>
      </div>

      {/* Tours Favorites */}
      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
            <Compass size={20} />
          </div>
          <h3 className="text-2xl font-black text-slate-900">Избранные туры</h3>
        </div>

        {favoriteTours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {favoriteTours.map(t => (
              <TourCard 
                key={t.id} 
                tour={t} 
                onClick={() => setSelectedTour(t)} 
                isFavorite={true}
                onToggleFavorite={(e) => onToggleFavoriteTour(e, t)}
              />
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={<Compass />} 
            title="Нет избранных туров" 
            description="Добавляйте туры в закладки, чтобы не потерять их." 
            actionTitle="Найти туры"
            onAction={() => setActiveTab('tours')}
          />
        )}
      </section>

      {/* Property Favorites */}
      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
            <Heart size={20} />
          </div>
          <h3 className="text-2xl font-black text-slate-900">Избранное жилье</h3>
        </div>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {favorites.map(p => (
              <PropertyCard key={p.id} property={p} onClick={() => setSelectedProperty(p)} />
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={<Heart />} 
            title="Нет избранного жилья" 
            description="Сохраняйте лучшие апартаменты и гостевые дома." 
            actionTitle="Найти жилье"
            onAction={() => setActiveTab('search')}
          />
        )}
      </section>
    </motion.div>
  );
}

function EmptyState({ icon, title, description, actionTitle, onAction }: any) {
  return (
    <div className="bg-white rounded-[48px] py-20 text-center border border-slate-100 shadow-sm">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
        {icon}
      </div>
      <h4 className="text-xl font-black text-slate-900 mb-2">{title}</h4>
      <p className="text-slate-500 max-w-xs mx-auto mb-8 font-medium">
        {description}
      </p>
      <Button 
        variant="secondary"
        onClick={onAction}
        icon={<Search size={18} />}
        className="mx-auto rounded-2xl"
      >
        {actionTitle}
      </Button>
    </div>
  );
}
