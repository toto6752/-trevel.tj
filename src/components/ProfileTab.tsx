import { motion } from 'motion/react';
import { User as UserIcon, Settings, CreditCard, Bell, Shield, LogOut, ChevronRight, MapPin, Calendar } from 'lucide-react';

interface ProfileTabProps {
  user: any;
  onLogout: () => void;
}

const MOCK_BOOKINGS = [
  { id: 1, title: 'Апартаменты "Памир"', date: '15.05.2026 - 20.05.2026', status: 'Предстоящая', city: 'Душанбе' },
  { id: 2, title: 'Горный домик "Зиндон"', date: '10.04.2026 - 12.04.2026', status: 'Завершена', city: 'Фанские горы' },
];

export default function ProfileTab({ user, onLogout }: ProfileTabProps) {
  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-6xl mx-auto space-y-12 pb-24"
    >
      <div className="grid grid-cols-12 gap-8">
        {/* Profile Card */}
        <section className="col-span-12 lg:col-span-4 bg-white rounded-[48px] p-10 border border-slate-200 shadow-sm flex flex-col items-center text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-emerald-100 rounded-[40px] flex items-center justify-center text-emerald-700 text-4xl font-black shadow-xl shadow-emerald-500/10 border-4 border-white">
              {user?.name?.substring(0, 2) || 'AM'}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-3 rounded-2xl shadow-lg border-2 border-white">
               <Settings size={20} />
            </div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">{user?.name || 'Alexander'}</h2>
          <p className="text-slate-400 font-bold mb-8 italic">alexander.m@example.com</p>
          
          <div className="w-full space-y-3">
             <button className="w-full flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all font-bold text-slate-700 group">
                <div className="flex items-center gap-4">
                   <CreditCard size={20} className="text-slate-400 group-hover:text-emerald-600" />
                   Пополнить баланс
                </div>
                <ChevronRight size={18} className="text-slate-300" />
             </button>
             <button className="w-full flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all font-bold text-slate-700 group">
                <div className="flex items-center gap-4">
                   <Bell size={20} className="text-slate-400 group-hover:text-emerald-600" />
                   Уведомления
                </div>
                <div className="bg-rose-500 w-2.5 h-2.5 rounded-full" />
             </button>
             <button className="w-full flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all font-bold text-slate-700 group">
                <div className="flex items-center gap-4">
                   <Shield size={20} className="text-slate-400 group-hover:text-emerald-600" />
                   Безопасность
                </div>
                <ChevronRight size={18} className="text-slate-300" />
             </button>
          </div>

          <button 
            onClick={onLogout}
            className="mt-12 text-slate-400 font-black flex items-center gap-2 hover:text-rose-500 transition-colors uppercase tracking-widest text-[10px]"
          >
             <LogOut size={16} />
             Выйти из аккаунта
          </button>
        </section>

        {/* Bookings & History */}
        <section className="col-span-12 lg:col-span-8 space-y-8">
           <div className="bg-slate-900 rounded-[48px] p-12 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full" />
              <h3 className="text-3xl font-black mb-8 relative z-10">Твои поездки</h3>
              
              <div className="space-y-6 relative z-10">
                 {MOCK_BOOKINGS.map(booking => (
                    <div key={booking.id} className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex items-center justify-between group hover:bg-white/20 transition-all">
                       <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-900 group-hover:scale-110 transition-transform">
                             <Calendar size={28} />
                          </div>
                          <div>
                             <h4 className="font-black text-lg mb-1">{booking.title}</h4>
                             <div className="flex items-center gap-4 text-xs font-bold text-white/50">
                                <div className="flex items-center gap-1">
                                   <MapPin size={12} />
                                   {booking.city}
                                </div>
                                <div className="flex items-center gap-1">
                                   {booking.date}
                                </div>
                             </div>
                          </div>
                       </div>
                       <div className="flex flex-col items-end gap-2">
                          <span className={cn(
                             "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                             booking.status === 'Предстоящая' ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/40"
                          )}>
                             {booking.status}
                          </span>
                          <button className="text-xs font-bold text-white hover:underline">Детали</button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-[40px] p-10 border border-slate-200">
                 <div className="text-4xl font-black text-slate-900 mb-2">1,240 <span className="text-sm font-bold text-slate-400">TJS</span></div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Твой баланс</div>
              </div>
              <div className="bg-emerald-600 rounded-[40px] p-10 text-white shadow-xl shadow-emerald-700/20">
                 <div className="text-4xl font-black mb-2">320 <span className="text-sm font-bold text-white/60">бонусов</span></div>
                 <div className="text-[10px] font-black text-white/60 uppercase tracking-widest">Программа лояльности</div>
              </div>
           </div>
        </section>
      </div>
    </motion.div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
