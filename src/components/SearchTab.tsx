import { motion } from 'motion/react';
import { Search, MapPin, Home as HomeIcon } from 'lucide-react';
import HousingCard from './HousingCard';
import { Property, City, PropertyType } from '../types';

interface SearchTabProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCity: City | 'Все';
  setSelectedCity: (c: City | 'Все') => void;
  selectedType: PropertyType | 'Все';
  setSelectedType: (t: PropertyType | 'Все') => void;
  filteredProperties: Property[];
  setSelectedProperty: (p: Property) => void;
  cities: (City | 'Все')[];
  types: (PropertyType | 'Все')[];
}

export default function SearchTab({
  searchQuery,
  setSearchQuery,
  selectedCity,
  setSelectedCity,
  selectedType,
  setSelectedType,
  filteredProperties,
  setSelectedProperty,
  cities,
  types
}: SearchTabProps) {
  return (
    <motion.div
      key="search"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-12 pb-12"
    >
      <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-200 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Search Input */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Что ищем?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 font-bold text-slate-800"
            />
          </div>

          {/* City Select */}
          <div className="relative">
            <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <select 
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-14 pr-10 appearance-none focus:outline-none font-bold text-slate-800 cursor-pointer"
            >
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Type Select */}
          <div className="relative">
            <HomeIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-14 pr-10 appearance-none focus:outline-none font-bold text-slate-800 cursor-pointer"
            >
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProperties.length > 0 ? (
          filteredProperties.map(p => (
            <HousingCard key={p.id} property={p} onClick={() => setSelectedProperty(p)} />
          ))
        ) : (
          <div className="col-span-full py-24 text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={40} className="text-slate-200" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Ничего не найдено</h3>
            <p className="text-slate-500">Попробуйте изменить параметры поиска или спросите нашего ИИ-ассистента.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
