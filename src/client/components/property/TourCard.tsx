import { Star, ChevronRight, Clock, Phone, MessageCircle, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { Tour } from '../../types';
import { formatCurrency, cn } from '../../utils';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

interface TourCardProps {
  tour: Tour;
  onClick: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}

export default function TourCard({ tour, onClick, isFavorite, onToggleFavorite }: TourCardProps) {
  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = `Здравствуйте, меня интересует тур: ${tour.title}`;
    const phone = tour.contacts.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = tour.contacts.replace(/[^0-9]/g, '');
    window.location.href = `tel:+${phone}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -12 }}
      onClick={onClick}
      className="bg-white rounded-[40px] overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl hover:border-emerald-200 transition-all cursor-pointer group flex flex-col h-full"
    >
      <div className="relative h-64 overflow-hidden">
        <img 
          src={tour.images?.[0] || 'https://picsum.photos/seed/tour/800/600'} 
          alt={tour.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4">
          <Badge variant="amber" className="bg-white/90 backdrop-blur-md shadow-sm">
            {tour.city}
          </Badge>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
           {onToggleFavorite && (
             <button
               onClick={onToggleFavorite}
               className={cn(
                 "p-2 rounded-xl backdrop-blur-md transition-all shadow-sm border border-white/20",
                 isFavorite ? "bg-rose-500 text-white" : "bg-white/90 text-slate-400 hover:text-rose-500"
               )}
             >
               <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
             </button>
           )}
           <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-1 text-[10px] font-black text-amber-600 shadow-sm">
             <Star size={12} fill="currentColor" />
             {tour.rating}
           </div>
        </div>
      </div>

      <div className="p-8 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-black text-xl text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight line-clamp-2">
            {tour.title}
          </h3>
        </div>

        <p className="text-sm text-slate-500 line-clamp-2 mb-4 font-medium">
          {tour.description}
        </p>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <Clock size={14} className="text-emerald-500" />
            <span>{tour.duration || 'Гибко'}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6">
          <button 
            onClick={handleCall}
            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 py-3 rounded-2xl transition-all text-xs font-black uppercase tracking-tighter"
          >
            <Phone size={14} />
            Позвонить
          </button>
          <button 
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl transition-all text-xs font-black uppercase tracking-tighter shadow-lg shadow-emerald-600/20"
          >
            <MessageCircle size={14} />
            WhatsApp
          </button>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto">
          <div className="text-2xl font-black text-slate-900">
            {formatCurrency(tour.price)}
            <span className="text-xs font-bold text-slate-400 ml-1">/ тур</span>
          </div>
          <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center group-hover:bg-emerald-600 transition-colors shadow-lg">
            <ChevronRight size={20} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
