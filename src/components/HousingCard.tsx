/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Star, Heart, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Property } from '../types';
import { formatCurrency } from '../utils';

interface HousingCardProps {
  property: Property;
  onClick: () => void;
}

export default function HousingCard({ property, onClick }: HousingCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      onClick={onClick}
      className="bg-white rounded-[32px] overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all cursor-pointer group flex flex-col h-full"
    >
      <div className="relative h-64 overflow-hidden">
        <img 
          src={property.image} 
          alt={property.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-md text-[10px] font-black text-slate-900 px-4 py-2 rounded-xl shadow-sm uppercase tracking-widest border border-white/20">
            {property.city}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <button className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors shadow-sm">
            <Heart size={18} />
          </button>
        </div>
      </div>

      <div className="p-8 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-black text-xl text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight line-clamp-2">
            {property.title}
          </h3>
          <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-lg border border-amber-100 text-[10px] font-black flex-shrink-0">
            <Star size={12} fill="currentColor" />
            {property.rating}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 mt-auto">
          {property.amenities.slice(0, 3).map(a => (
            <span key={a} className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              • {a}
            </span>
          ))}
          {property.amenities.length > 3 && (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              + {property.amenities.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <div className="text-2xl font-black text-slate-900">
            {formatCurrency(property.price)}
            <span className="text-xs font-bold text-slate-400 ml-1">/ ночь</span>
          </div>
          <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center group-hover:bg-emerald-600 transition-colors shadow-lg">
            <ChevronRight size={20} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
