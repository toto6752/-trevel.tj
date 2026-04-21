import { useState } from 'react';
import { LogIn, UserPlus, ShieldCheck, Mail, Lock, User, Phone, MessageSquare, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Button from '../ui/Button';
import { api } from '../../api';
import { cn } from '../../utils';

interface AuthFormProps {
  onLogin: (user: any, token: string) => void;
}

type AuthMode = 'login' | 'register';
type UserRole = 'tourist' | 'creator';

export default function AuthForm({ onLogin }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<UserRole>('tourist');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    whatsapp: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation for Register
    if (mode === 'register') {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Пожалуйста, заполните все обязательные поля');
        setIsLoading(false);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Пароли не совпадают');
        setIsLoading(false);
        return;
      }
      if (role === 'creator' && !formData.phone) {
        setError('Для авторов номер телефона обязателен');
        setIsLoading(false);
        return;
      }
    }

    try {
      if (mode === 'register') {
        const res = await api.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role,
          phone: formData.phone,
          whatsapp: formData.whatsapp
        });
        
        if (res.error) throw new Error(res.error);
        
        setSuccess('Регистрация успешна! Теперь вы можете войти.');
        setMode('login');
      } else {
        const res = await api.login({
          email: formData.email,
          password: formData.password
        });
        
        if (res.error) throw new Error(res.error);
        
        localStorage.setItem('token', res.token);
        onLogin(res.user, res.token);
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка сервера. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-xl mx-auto py-8 md:py-16 px-4"
    >
      <div className="bg-white p-8 md:p-12 rounded-[40px] md:rounded-[48px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
        
        <div className="relative">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-600/20">
              {mode === 'login' ? <LogIn size={32} /> : <UserPlus size={32} />}
            </div>
          </div>

          <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 text-center">
            {mode === 'login' ? 'С возвращением!' : 'Создать аккаунт'}
          </h3>
          <p className="text-slate-400 font-bold mb-10 text-sm text-center">
            {mode === 'login' 
              ? 'Войдите, чтобы продолжить ваше путешествие по Таджикистану.' 
              : 'Присоединяйтесь к сообществу путешественников и авторов.'}
          </p>

          {/* Role Toggle for Register */}
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                type="button"
                onClick={() => setRole('tourist')}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all group",
                  role === 'tourist' 
                    ? "border-emerald-600 bg-emerald-50/50 text-emerald-900" 
                    : "border-slate-100 bg-slate-50 text-slate-400 grayscale hover:grayscale-0 hover:border-slate-200"
                )}
              >
                <User size={24} className={cn(role === 'tourist' ? "text-emerald-600" : "text-slate-400")} />
                <span className="text-xs font-black uppercase tracking-widest">Я турист</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('creator')}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all group",
                  role === 'creator' 
                    ? "border-emerald-600 bg-emerald-50/50 text-emerald-900" 
                    : "border-slate-100 bg-slate-50 text-slate-400 grayscale hover:grayscale-0 hover:border-slate-200"
                )}
              >
                <ShieldCheck size={24} className={cn(role === 'creator' ? "text-emerald-600" : "text-slate-400")} />
                <span className="text-xs font-black uppercase tracking-widest">Я автор туров</span>
              </button>
            </div>
          )}

          {/* Messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  {error}
                </div>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold">
                  <CheckCircle2 size={18} className="flex-shrink-0" />
                  {success}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <label className="text-[10px] uppercase font-black text-slate-400 mb-2 block tracking-widest pl-2">Как вас зовут?</label>
                <div className="relative group">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input 
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    type="text" 
                    placeholder="Александр" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all" 
                  />
                </div>
              </motion.div>
            )}

            <div>
              <label className="text-[10px] uppercase font-black text-slate-400 mb-2 block tracking-widest pl-2">Электронная почта</label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                <input 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  type="email" 
                  placeholder="name@example.com" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] uppercase font-black text-slate-400 mb-2 block tracking-widest pl-2">Пароль</label>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input 
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all" 
                  />
                </div>
              </div>
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <label className="text-[10px] uppercase font-black text-slate-400 mb-2 block tracking-widest pl-2">Подтвердите пароль</label>
                  <div className="relative group">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <input 
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      type="password" 
                      placeholder="••••••••" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all" 
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {mode === 'register' && role === 'creator' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-50 overflow-hidden"
              >
                <div>
                  <label className="text-[10px] uppercase font-black text-slate-400 mb-2 block tracking-widest pl-2">Телефон</label>
                  <div className="relative group">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <input 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      type="tel" 
                      placeholder="+992 900 00 00" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all" 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-black text-slate-400 mb-2 block tracking-widest pl-2">WhatsApp (по желанию)</label>
                  <div className="relative group">
                    <MessageSquare className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <input 
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      type="tel" 
                      placeholder="+992 900 00 00" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all" 
                    />
                  </div>
                </div>
              </motion.div>
            )}
            
            <div className="pt-4">
              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full py-5 text-lg group"
                size="lg"
                icon={isLoading ? <Loader2 className="animate-spin" size={18} /> : <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              >
                {isLoading ? 'ОБРАБОТКА...' : mode === 'login' ? 'ВОЙТИ В АККАУНТ' : 'ЗАРЕГИСТРИРОВАТЬСЯ'}
              </Button>
            </div>
          </form>
          
          <div className="mt-10 pt-10 border-t border-slate-50 flex flex-col items-center">
            <p className="text-sm text-slate-400 font-bold mb-4">
              {mode === 'login' ? 'Еще нет аккаунта?' : 'Уже есть аккаунт?'}
            </p>
            <button 
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError(null);
                setSuccess(null);
              }}
              className="text-emerald-600 hover:text-emerald-700 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all"
            >
              {mode === 'login' ? 'Создать новый аккаунт' : 'Войти в существующий'}
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
      
      <p className="mt-12 text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-relaxed opacity-50">
        Продолжая, вы соглашаетесь с условиями обслуживания<br />и политикой конфиденциальности Travel-TJ.
      </p>
    </motion.div>
  );
}

function Loader2({ className, size }: { className?: string, size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={cn("animate-spin", className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
