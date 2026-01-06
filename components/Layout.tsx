
import React, { useState, useEffect } from 'react';
import { APP_NAME } from '../constants';
import { User, AppView, UserRole, Subscription } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  currentView: AppView;
  setView: (view: AppView) => void;
  onLogout: () => void;
}

const GlobalCountdownBanner: React.FC<{ user: User }> = ({ user }) => {
  const [urgentSub, setUrgentSub] = useState<Subscription | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const checkSubscriptions = () => {
      const saved = localStorage.getItem(`ft_subs_${user.id}`);
      if (saved) {
        const subs: Subscription[] = JSON.parse(saved);
        const active = subs
          .filter(s => s.status === 'ACTIVE')
          .sort((a, b) => new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime());
        
        if (active.length > 0) {
          setUrgentSub(active[0]);
        }
      }
    };

    checkSubscriptions();
    window.addEventListener('storage', checkSubscriptions);
    const interval = setInterval(checkSubscriptions, 5000);
    
    return () => {
      window.removeEventListener('storage', checkSubscriptions);
      clearInterval(interval);
    };
  }, [user.id]);

  useEffect(() => {
    if (!urgentSub) return;

    const timer = setInterval(() => {
      const target = new Date(urgentSub.nextPaymentDate).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft(null);
      } else {
        setTimeLeft({
          d: Math.floor(diff / (1000 * 60 * 60 * 24)),
          h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [urgentSub]);

  if (!timeLeft || timeLeft.d > 3) return null;

  return (
    <div className="w-full h-16 bg-[#FB6E67] text-white flex items-center justify-center relative overflow-hidden shadow-lg z-30 animate-pulse border-b border-black/5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-50"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-between items-center relative z-10 gap-4">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="hidden sm:flex w-10 h-10 bg-white/20 rounded-xl items-center justify-center backdrop-blur-md flex-shrink-0">
            <svg className="w-5 h-5 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <p className="text-[15px] font-black tracking-tight leading-none mb-0.5 text-white whitespace-nowrap overflow-hidden text-ellipsis">
              Action Required: Contribution Due
            </p>
            <p className="text-[14px] font-black tracking-tight whitespace-nowrap overflow-hidden text-ellipsis opacity-90">
              Next Payment In: <span className="font-mono bg-black/10 px-1.5 py-0.5 rounded ml-1">{timeLeft.d}d {timeLeft.h}h {timeLeft.m}m {timeLeft.s}s</span>
            </p>
          </div>
        </div>
        <button 
          className="bg-white text-[#FB6E67] px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest shadow-xl hover:bg-gray-50 active:scale-95 transition-all whitespace-nowrap flex-shrink-0"
          onClick={() => window.dispatchEvent(new CustomEvent('open-payment-modal', { detail: urgentSub }))}
        >
          PAY NOW
        </button>
      </div>
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ children, user, currentView, setView, onLogout }) => {
  const firstName = user?.name.split(' ')[0] || 'User';
  const isAuthView = !user;

  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 ${isAuthView ? 'h-screen overflow-hidden' : ''}`}>
      {/* Header - Hidden on AuthView for Zero-Scroll Gateway */}
      {user && (
        <header className="bg-white border-b border-gray-100 sticky top-0 z-40 h-16 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex justify-between items-center h-full">
              <div className="flex items-center">
                <div 
                  className="flex items-center space-x-3 cursor-pointer py-1 px-2 rounded-xl hover:bg-gray-50 transition-colors"
                  onClick={() => setView('PROFILE')}
                >
                  <img 
                    src={user.avatarUrl} 
                    alt={user.name} 
                    className={`w-10 h-10 rounded-xl border-2 transition-all ${currentView === 'PROFILE' ? 'border-green-600 shadow-md' : 'border-gray-100'}`} 
                  />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Hi,</p>
                    <p className="text-sm font-bold text-gray-900 leading-tight">{firstName}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-4">
                <button 
                  title="Customer Service"
                  className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:text-green-600 hover:bg-green-50 transition-all active:scale-90"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </button>

                <button 
                  title="Notifications"
                  className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:text-green-600 hover:bg-green-50 transition-all relative active:scale-90"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <nav className="hidden lg:flex items-center ml-2 pl-4 border-l border-gray-100">
                  <button 
                    onClick={() => setView('SYSTEM_DESIGN')}
                    className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest ${currentView === 'SYSTEM_DESIGN' ? 'text-green-600' : 'text-gray-400 hover:text-gray-700'}`}
                  >
                    Tech Spec
                  </button>
                  <button 
                    onClick={() => setView(user.role === UserRole.ADMIN ? 'ADMIN_DASHBOARD' : 'CUSTOMER_DASHBOARD')}
                    className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest ${currentView === 'CUSTOMER_DASHBOARD' || currentView === 'ADMIN_DASHBOARD' ? 'text-green-600' : 'text-gray-400 hover:text-gray-700'}`}
                  >
                    Dashboard
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* High-Visibility Global Countdown Banner */}
      {user && user.role === UserRole.CUSTOMER && <GlobalCountdownBanner user={user} />}

      {/* Main Content */}
      <main className={`flex-1 w-full max-w-7xl mx-auto ${isAuthView ? 'px-0 py-0 flex items-center justify-center' : 'px-4 sm:px-6 lg:px-8 py-6'}`}>
        {children}
      </main>

      {/* Footer - Only visible when logged in to prevent scrolling on Gateway */}
      {user && (
        <footer className="bg-white border-t border-gray-50 py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center items-center space-x-3 mb-4">
              <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
                <img src="logo.png" alt="" className="w-full h-full object-contain opacity-40 hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-sm font-bold text-gray-400">{APP_NAME}</span>
            </div>
            <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em]">Products of DARE ADU</p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
