
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import CustomerDashboard from './views/CustomerDashboard';
import AdminDashboard from './views/AdminDashboard';
import SystemDesign from './views/SystemDesign';
import Toast, { ToastMessage } from './components/Toast';
import { User, AppView, UserRole } from './types';
import { MOCK_USER, MOCK_ADMIN } from './constants';

const FoodThriftIcon = ({ size = "w-40 h-40" }: { size?: string }) => (
  <div className={`relative ${size} mx-auto mb-4 drop-shadow-[0_15px_40px_rgba(251,110,103,0.25)] flex items-center justify-center`}>
    <img 
      src="logo.png" 
      alt="FoodThrift Logo" 
      className="w-full h-full object-contain"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  </div>
);

type CustomerAuthMode = 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD';

const App: React.FC = () => {
  // Persistence Layer
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ft_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentView, setCurrentView] = useState<AppView>(() => {
    const saved = localStorage.getItem('ft_active_view');
    return (saved as AppView) || 'AUTH';
  });
  
  const [authStage, setAuthStage] = useState<'LANDING' | 'CUSTOMER_AUTH'>('LANDING');
  const [customerAuthMode, setCustomerAuthMode] = useState<CustomerAuthMode>('LOGIN');
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Persist session changes
  useEffect(() => {
    if (user) localStorage.setItem('ft_session', JSON.stringify(user));
    else localStorage.removeItem('ft_session');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('ft_active_view', currentView);
  }, [currentView]);

  const addToast = (message: string, type: ToastMessage['type'] = 'SUCCESS') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const message = customerAuthMode === 'LOGIN' ? 'Welcome back' : 
                   customerAuthMode === 'SIGNUP' ? 'Account created' : 'Check your email';
    
    setTimeout(() => {
      if (customerAuthMode === 'FORGOT_PASSWORD') {
        addToast("Recovery email sent", "INFO");
        setCustomerAuthMode('LOGIN');
        setIsLoading(false);
      } else {
        setUser(MOCK_USER);
        setCurrentView('CUSTOMER_DASHBOARD');
        setIsLoading(false);
        addToast(`${message}, ${MOCK_USER.name.split(' ')[0]}`);
      }
    }, 1200);
  };

  const handleAdminAccess = () => {
    setIsLoading(true);
    setTimeout(() => {
      setUser(MOCK_ADMIN);
      setCurrentView('ADMIN_DASHBOARD');
      setIsLoading(false);
      addToast("Admin Dashboard Loaded", "INFO");
    }, 800);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('AUTH');
    setAuthStage('LANDING');
    setCustomerAuthMode('LOGIN');
    addToast("Logged out successfully", "INFO");
  };

  return (
    <Layout user={user} currentView={currentView} setView={setCurrentView} onLogout={handleLogout}>
      <Toast toasts={toasts} removeToast={removeToast} />
      {currentView === 'AUTH' ? (
        <div className="w-full h-full flex flex-col justify-between p-6 md:p-12 overflow-hidden">
          {authStage === 'LANDING' ? (
            <>
              {/* Central Content Area */}
              <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto animate-fadeIn">
                <div className="text-center mb-10 md:mb-12">
                  <FoodThriftIcon size="w-32 h-32 md:w-40 md:h-40" />
                  <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-none mt-4">PaySmallSmall</h1>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] mt-3">
                    <span className="text-gray-400">By </span>
                    <span className="text-[#fc6a60]">FoodThrift Ltd</span>
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full">
                  {/* My Account Card */}
                  <button 
                    onClick={() => { setAuthStage('CUSTOMER_AUTH'); setCustomerAuthMode('LOGIN'); }} 
                    className="flex flex-col h-full bg-white p-8 rounded-[40px] border-[0.5px] border-[#fc6a60]/50 shadow-xl shadow-[#fc6a60]/5 hover:shadow-2xl hover:scale-[1.01] transition-all text-left group"
                  >
                    <div className="w-12 h-12 bg-[#fc6a60] text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-black text-[#fc6a60] leading-tight mb-3">My Account</h3>
                      <p className="text-xs text-[#fc6a60]/70 font-bold leading-relaxed">Securely manage your contributions and food plan progress.</p>
                    </div>
                  </button>

                  {/* Admin Panel Card */}
                  <button 
                    onClick={handleAdminAccess} 
                    className="flex flex-col h-full bg-white p-8 rounded-[40px] border-[0.5px] border-gray-950/50 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:scale-[1.01] transition-all text-left group"
                  >
                    <div className="w-12 h-12 bg-gray-950 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gray-800 transition-all shadow-lg flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-black text-gray-950 leading-tight mb-3">Admin Panel</h3>
                      <p className="text-xs text-gray-400 font-bold leading-relaxed">Oversee logistics, reconcile accounts, and manage catalog.</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Fixed Footer Position */}
              <div className="text-center pt-8 pb-4">
                <div className="text-[9px] text-gray-300 font-bold uppercase tracking-[0.2em]">
                  Products of DARE ADU
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="w-full max-w-sm flex flex-col items-center">
                <form onSubmit={handleAuthSubmit} className="w-full bg-white rounded-[32px] md:rounded-[40px] shadow-2xl p-8 md:p-10 border border-gray-50 animate-fadeIn text-center">
                  <div className="scale-75 -mt-4 mb-2">
                    <FoodThriftIcon />
                  </div>
                  
                  {/* Dynamic Auth Titles */}
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight mb-1">
                    {customerAuthMode === 'LOGIN' ? 'Welcome Back' : 
                     customerAuthMode === 'SIGNUP' ? 'Create Account' : 'Recover Access'}
                  </h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">
                    {customerAuthMode === 'LOGIN' ? 'Sign in to your vault' : 
                     customerAuthMode === 'SIGNUP' ? 'Join the ecosystem' : 'Unlock your secure vault'}
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    {customerAuthMode === 'SIGNUP' && (
                      <input required type="text" placeholder="Full Name" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-xs font-semibold outline-none focus:ring-4 focus:ring-red-50 focus:border-[#fc6a60] transition-all" />
                    )}
                    
                    <input required type="email" placeholder="Email Address" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-xs font-semibold outline-none focus:ring-4 focus:ring-red-50 focus:border-[#fc6a60] transition-all" />
                    
                    {customerAuthMode === 'SIGNUP' && (
                      <input required type="tel" placeholder="Phone Number" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-xs font-semibold outline-none focus:ring-4 focus:ring-red-50 focus:border-[#fc6a60] transition-all" />
                    )}

                    {customerAuthMode !== 'FORGOT_PASSWORD' && (
                      <input required type="password" placeholder="Password" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-xs font-semibold outline-none focus:ring-4 focus:ring-red-50 focus:border-[#fc6a60] transition-all" />
                    )}
                  </div>

                  <button type="submit" disabled={isLoading} className="w-full py-4 bg-[#fc6a60] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#fc6a60]/20 active:scale-95 transition-all">
                    {isLoading ? 'Verifying...' : 
                     customerAuthMode === 'LOGIN' ? 'Login Securely' : 
                     customerAuthMode === 'SIGNUP' ? 'Start My Plan' : 'Reset Password'}
                  </button>
                  
                  {/* Secondary Navigation Links */}
                  <div className="mt-6 flex flex-col space-y-3">
                    {customerAuthMode === 'LOGIN' && (
                      <>
                        <button type="button" onClick={() => setCustomerAuthMode('FORGOT_PASSWORD')} className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-[#fc6a60] transition-colors">
                          Forgot Password?
                        </button>
                        <button type="button" onClick={() => setCustomerAuthMode('SIGNUP')} className="text-[9px] font-black text-gray-500 uppercase tracking-widest border-t border-gray-50 pt-3 hover:text-gray-900 transition-colors">
                          Don't have an account? <span className="text-[#fc6a60]">Sign Up</span>
                        </button>
                      </>
                    )}
                    
                    {customerAuthMode !== 'LOGIN' && (
                      <button type="button" onClick={() => setCustomerAuthMode('LOGIN')} className="text-[9px] font-black text-gray-500 uppercase tracking-widest hover:text-gray-900 transition-colors">
                        Back to <span className="text-[#fc6a60]">Sign In</span>
                      </button>
                    )}

                    <button type="button" onClick={() => setAuthStage('LANDING')} className="mt-2 text-[9px] font-bold text-gray-300 uppercase tracking-[0.2em] hover:text-gray-900 transition-colors">
                      ← Return Home
                    </button>
                  </div>
                </form>
                <div className="mt-6 text-[9px] text-gray-300 font-bold uppercase tracking-[0.2em]">
                  Secure Contributory Ecosystem
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {(currentView === 'CUSTOMER_DASHBOARD' || currentView === 'PROFILE') && user && (
            <CustomerDashboard 
              user={user} 
              onLogout={handleLogout} 
              addToast={addToast} 
              requestedView={currentView === 'PROFILE' ? 'PROFILE' : 'HOME'}
            />
          )}
          {currentView === 'ADMIN_DASHBOARD' && <AdminDashboard addToast={addToast} />}
          {currentView === 'SYSTEM_DESIGN' && <SystemDesign />}
        </>
      )}
    </Layout>
  );
};

export default App;
