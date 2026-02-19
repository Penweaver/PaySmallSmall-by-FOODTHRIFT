import React, { useState, useEffect } from 'react';
import { MOCK_PLANS } from '../constants';
import { Subscription, FoodPlan, User, LedgerTransaction } from '../types';
import { getFinancialAdvice } from '../services/geminiService';
import { ToastMessage } from '../components/Toast';

type MainView = 'HOME' | 'REWARDS' | 'RECIPES' | 'PROFILE';
type HomeTab = 'SUBSCRIPTIONS' | 'PLANS' | 'HISTORY';
type CheckoutStep = 'METHOD_SELECT' | 'PROCESSING' | 'SUCCESS';

interface CustomerDashboardProps {
  user: User;
  onLogout: () => void;
  addToast: (msg: string, type?: ToastMessage['type']) => void;
  requestedView?: MainView;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ user, onLogout, addToast, requestedView }) => {
  const [activeView, setActiveView] = useState<MainView>('HOME');
  const [activeHomeTab, setActiveHomeTab] = useState<HomeTab>('SUBSCRIPTIONS');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Profile Specific State
  const [profileData, setProfileData] = useState({
    nickName: 'Baba Dee',
    kycLevel: 'Tier 3',
    gender: 'Male',
    dob: 'Dec 14, 1988',
    address: '12, Oladipo Diya Way, Lagos',
    occupation: 'Senior Engineer',
    accountNumber: '802 239 6343'
  });

  useEffect(() => {
    if (requestedView) {
      setActiveView(requestedView);
    }
  }, [requestedView]);
  
  const [activeSubscriptions, setActiveSubscriptions] = useState<Subscription[]>(() => {
    const saved = localStorage.getItem(`ft_subs_${user.id}`);
    if (saved) return JSON.parse(saved);
    
    // Default mock with a 2-day countdown for demo
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 2);
    nextDate.setHours(14, 0, 0, 0);

    return [
      {
        id: 'sub_1',
        userId: user.id,
        planId: 'plan_1',
        startDate: '2024-01-01',
        nextPaymentDate: nextDate.toISOString(),
        totalPaid: 45000,
        totalTarget: 60000,
        status: 'ACTIVE'
      }
    ];
  });

  const [transactions, setTransactions] = useState<LedgerTransaction[]>(() => {
    const saved = localStorage.getItem(`ft_ledger_${user.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(`ft_subs_${user.id}`, JSON.stringify(activeSubscriptions));
    localStorage.setItem(`ft_ledger_${user.id}`, JSON.stringify(transactions));
  }, [activeSubscriptions, transactions, user.id]);

  const [advice, setAdvice] = useState<string>("");
  const [showCheckout, setShowCheckout] = useState<boolean>(false);
  const [selectedSubForPayment, setSelectedSubForPayment] = useState<Subscription | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('METHOD_SELECT');

  useEffect(() => {
    const init = async () => {
      const totalEquity = activeSubscriptions.reduce((a, b) => a + b.totalPaid, 0);
      const tip = await getFinancialAdvice(`User ${user.name} has ₦${totalEquity} in total food savings across ${activeSubscriptions.length} plans.`);
      setAdvice(tip);
      setTimeout(() => setIsLoading(false), 800);
    };
    init();
  }, [user.name]);

  // Listen for global banner "Pay Now" trigger
  useEffect(() => {
    const handleGlobalPay = (e: any) => {
      openPaymentModal(e.detail);
    };
    window.addEventListener('open-payment-modal', handleGlobalPay);
    return () => window.removeEventListener('open-payment-modal', handleGlobalPay);
  }, [activeSubscriptions]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const totalEquity = activeSubscriptions.reduce((a, b) => a + b.totalPaid, 0);
    const tip = await getFinancialAdvice(`User ${user.name} refreshed their savings containing ₦${totalEquity}.`);
    setAdvice(tip);
    setTimeout(() => {
      setIsRefreshing(false);
      addToast("Transactions synchronized", "INFO");
    }, 1000);
  };

  const getPlanDetails = (planId: string) => {
    const catalog = localStorage.getItem('ft_plans');
    const plans: FoodPlan[] = catalog ? JSON.parse(catalog) : MOCK_PLANS;
    return plans.find(p => p.id === planId) || MOCK_PLANS[0];
  };

  const openPaymentModal = (sub: Subscription) => {
    setSelectedSubForPayment(sub);
    setShowCheckout(true);
    setCheckoutStep('METHOD_SELECT');
  };

  const handlePayment = (provider: 'Paystack' | 'Flutterwave') => {
    if (!selectedSubForPayment) return;
    setCheckoutStep('PROCESSING');
    const plan = getPlanDetails(selectedSubForPayment.planId);
    
    setTimeout(() => {
      const amount = plan.amount;
      
      // Update next payment date by 1 week
      const nextDate = new Date(selectedSubForPayment.nextPaymentDate);
      nextDate.setDate(nextDate.getDate() + 7);

      const updatedSubs = activeSubscriptions.map(s => 
        s.id === selectedSubForPayment.id ? { ...s, totalPaid: s.totalPaid + amount, nextPaymentDate: nextDate.toISOString() } : s
      );
      setActiveSubscriptions(updatedSubs);

      const newTx: LedgerTransaction = {
        id: `TXN-${Date.now()}`,
        date: new Date().toLocaleString(),
        amount: amount,
        status: 'SUCCESS',
        ref: `${provider.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 99999)}`,
        type: 'CONTRIBUTION',
        provider: provider,
        planName: plan.name
      };
      setTransactions([newTx, ...transactions]);
      
      setCheckoutStep('SUCCESS');
      addToast(`Payment of ₦${amount.toLocaleString()} received via ${provider}`, "SUCCESS");
    }, 2500);
  };

  const totalPaidSoFar = activeSubscriptions.reduce((acc, sub) => acc + sub.totalPaid, 0);

  // Profile Helper Components
  const ProfileRow = ({ label, value, isVerified, isEditable = true, icon }: { label: string, value: string, isVerified?: boolean, isEditable?: boolean, icon?: React.ReactNode }) => (
    <div className={`flex items-center justify-between py-4 ${isEditable ? 'cursor-pointer active:bg-gray-50' : 'cursor-default'} transition-colors group`}>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {icon}
      </div>
      <div className="flex items-center space-x-2">
        {isVerified && (
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        <span className={`text-sm font-semibold ${isEditable ? 'text-gray-400' : 'text-gray-400 opacity-60'}`}>{value}</span>
        {isEditable && (
          <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto space-y-6 pb-24 animate-fadeIn">
      {/* Dynamic Header */}
      {activeView === 'PROFILE' ? (
        <div className="flex items-center px-2 py-4 space-x-4">
          <button onClick={() => { setActiveView('HOME'); setActiveHomeTab('SUBSCRIPTIONS'); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Profile</h1>
        </div>
      ) : (
        <div className="flex justify-between items-center px-2 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {activeView === 'HOME' ? (activeHomeTab === 'SUBSCRIPTIONS' ? 'My Savings' : activeHomeTab === 'PLANS' ? 'Food Plans' : 'History') :
               activeView === 'REWARDS' ? 'My Rewards' : 'Cookbook'}
            </h1>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">Status: Active</p>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={handleRefresh} className={`w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-900 shadow-sm transition-all active:scale-90 ${isRefreshing ? 'animate-spin' : ''}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <div className="px-1 min-h-[400px]">
        {isLoading ? (
          <div className="space-y-6"><div className="h-48 w-full bg-gray-200 animate-pulse rounded-3xl"></div></div>
        ) : (
          <div className="animate-slideUp">
            {activeView === 'HOME' && (
              <div className="space-y-6">
                {/* 1. Hero Savings Card */}
                <div className="mx-1 bg-green-600 rounded-[32px] p-7 text-white shadow-xl relative overflow-hidden">
                  <div className="relative z-10 space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-green-100 uppercase tracking-widest">Total Food Savings</p>
                      <h2 className="text-3xl font-bold">₦{totalPaidSoFar.toLocaleString()}</h2>
                      <p className="text-[10px] text-green-100 mt-1">Saved across {activeSubscriptions.length} active plans</p>
                    </div>
                    <div className="flex space-x-4 pt-2">
                      <div className="bg-white/10 px-3 py-2 rounded-xl flex-1 border border-white/20">
                        <p className="text-[8px] font-bold text-green-100 uppercase">Status</p>
                        <p className="text-sm font-bold">Secure</p>
                      </div>
                      <div className="bg-white/10 px-3 py-2 rounded-xl flex-1 border border-white/20">
                        <p className="text-[8px] font-bold text-green-100 uppercase">Verification</p>
                        <p className="text-sm font-bold">Confirmed</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. AI Information Briefing (Advice) */}
                <div className="bg-green-50 rounded-2xl p-4 border border-green-100 flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <p className="text-xs font-medium text-green-800 leading-relaxed italic">"{advice.split('.')[0] || "Stay consistent with your contributions for maximum food security."}."</p>
                </div>

                {/* 3. Top Tabs */}
                <div className="flex p-1 bg-gray-100 rounded-2xl mx-1 sticky top-4 z-10 border border-white">
                  {(['SUBSCRIPTIONS', 'PLANS', 'HISTORY'] as HomeTab[]).map((tab) => (
                    <button 
                      key={tab} 
                      onClick={() => setActiveHomeTab(tab)} 
                      className={`flex-1 py-3 text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all ${activeHomeTab === tab ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* 4. Tab Specific Content */}
                {activeHomeTab === 'SUBSCRIPTIONS' && (
                  <div className="space-y-4">
                    {activeSubscriptions.map(sub => {
                      const plan = getPlanDetails(sub.planId);
                      const progress = (sub.totalPaid / sub.totalTarget) * 100;
                      return (
                        <div key={sub.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
                          <div className="flex items-center space-x-4 mb-4">
                            <img src={plan.imageUrl} className="w-12 h-12 rounded-xl object-cover" alt="" />
                            <div className="flex-1">
                              <h4 className="text-sm font-bold text-gray-900 leading-tight">{plan.name}</h4>
                              <p className="text-[10px] font-medium text-gray-400 uppercase">₦{plan.amount.toLocaleString()} / week</p>
                            </div>
                            <span className="text-[9px] font-bold px-2 py-1 bg-green-50 text-green-600 rounded-lg uppercase">Active</span>
                          </div>
                          <div className="space-y-3">
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-green-600 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold uppercase">
                              <span className="text-gray-400">Paid: ₦{sub.totalPaid.toLocaleString()}</span>
                              <span className="text-gray-900">Goal: ₦{sub.totalTarget.toLocaleString()}</span>
                            </div>
                            <button onClick={() => openPaymentModal(sub)} className="w-full py-3 bg-gray-900 text-white rounded-xl text-[11px] font-bold uppercase shadow-md active:scale-95 transition-all">Make Payment</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {activeHomeTab === 'PLANS' && (
                  <div className="space-y-4 pb-8">
                     {MOCK_PLANS.map(plan => (
                       <div key={plan.id} className="bg-white rounded-3xl p-4 border border-gray-100 flex space-x-4 shadow-sm group">
                         <img src={plan.imageUrl} className="w-24 h-24 rounded-2xl object-cover group-hover:scale-105 transition-transform" />
                         <div className="flex-1 flex flex-col justify-between py-1">
                           <div>
                             <h4 className="text-sm font-bold text-gray-900">{plan.name}</h4>
                             <p className="text-[9px] font-medium text-gray-400 uppercase tracking-wider">{plan.category}</p>
                           </div>
                           <div className="flex justify-between items-end">
                             <p className="text-sm font-bold text-green-600">₦{plan.amount.toLocaleString()}</p>
                             <button className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg text-[9px] font-bold uppercase hover:bg-green-600 hover:text-white transition-colors">Select</button>
                           </div>
                         </div>
                       </div>
                     ))}
                  </div>
                )}

                {activeHomeTab === 'HISTORY' && (
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden">
                    {transactions.length === 0 ? (
                      <div className="p-12 text-center text-gray-400 text-xs font-medium">No history available.</div>
                    ) : (
                      transactions.map((tx) => (
                        <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-50 text-green-600">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900">{tx.planName}</p>
                              <p className="text-[9px] text-gray-400 font-medium uppercase">{tx.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">₦{tx.amount.toLocaleString()}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {activeView === 'REWARDS' && (
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-100 rounded-3xl p-8 text-center">
                  <div className="w-16 h-16 bg-yellow-400 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 18V7l10 11V7M5 10h14M5 14h14" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Thrift Rewards</h2>
                  <p className="text-sm text-gray-500 font-medium mt-2">Earn discounts on future plans by making timely payments.</p>
                </div>
              </div>
            )}

            {activeView === 'RECIPES' && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mb-4">Recipes for your plans</p>
                {[
                  { title: "One-Pot Jollof Rice", time: "45 mins", img: "https://picsum.photos/seed/jollof/400/300" }
                ].map((recipe, idx) => (
                  <div key={idx} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm group">
                    <img src={recipe.img} className="w-full h-40 object-cover group-hover:scale-105 transition-transform" />
                    <div className="p-4 flex justify-between items-center">
                      <h4 className="text-sm font-bold text-gray-900">{recipe.title}</h4>
                      <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-green-600 group-hover:text-white transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeView === 'PROFILE' && (
              <div className="space-y-6 px-1">
                <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="flex items-center space-x-6">
                    <img src={user.avatarUrl} className="w-20 h-20 rounded-[28px] object-cover border-2 border-white shadow-lg" alt="Avatar" />
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 leading-none">Hi, {user.name.split(' ')[0].toLowerCase()}</h2>
                      <p className="text-[10px] font-semibold text-gray-400 mt-2 uppercase tracking-wider">Account Secured</p>
                    </div>
                  </div>
                  <div className="mt-8 border-t border-gray-50 pt-2 divide-y divide-gray-50">
                    <ProfileRow label="Account Number" value={profileData.accountNumber} />
                    <ProfileRow label="Email" value={user.email} isVerified={true} isEditable={false} />
                  </div>
                </div>
                <div className="px-4 text-center">
                  <button onClick={onLogout} className="text-red-500 font-bold text-[10px] uppercase tracking-widest">Sign Out Account</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Selection Modal */}
      {showCheckout && selectedSubForPayment && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl animate-scaleIn">
            {checkoutStep === 'METHOD_SELECT' && (
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Payment</h3>
                <p className="text-xs text-gray-500 font-medium mb-6">Contribute to your {getPlanDetails(selectedSubForPayment.planId).name} savings.</p>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6 flex justify-between items-center">
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Amount Due</span>
                  <span className="text-xl font-bold text-gray-900">₦{getPlanDetails(selectedSubForPayment.planId).amount.toLocaleString()}</span>
                </div>
                <div className="space-y-3 mb-6">
                   <button onClick={() => handlePayment('Paystack')} className="w-full py-4 bg-[#011b33] text-white rounded-xl flex items-center justify-center space-x-3 shadow-md active:scale-95 transition-all">
                     <span className="text-[10px] font-bold uppercase tracking-wider">Pay with Paystack</span>
                   </button>
                   <button onClick={() => handlePayment('Flutterwave')} className="w-full py-4 bg-[#f5a623] text-white rounded-xl flex items-center justify-center space-x-3 shadow-md active:scale-95 transition-all">
                     <span className="text-[10px] font-bold uppercase tracking-wider">Pay with Flutterwave</span>
                   </button>
                </div>
                <button onClick={() => setShowCheckout(false)} className="w-full text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cancel</button>
              </div>
            )}
            {checkoutStep === 'PROCESSING' && (
              <div className="p-16 text-center">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <h3 className="text-lg font-bold text-gray-900">Processing Payment</h3>
              </div>
            )}
            {checkoutStep === 'SUCCESS' && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Payment Successful</h3>
                <button onClick={() => { setShowCheckout(false); setCheckoutStep('METHOD_SELECT'); }} className="w-full py-4 bg-gray-900 text-white rounded-xl text-[10px] font-bold uppercase shadow-md">Continue</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex justify-around items-center z-50">
        <button onClick={() => { setActiveView('HOME'); setActiveHomeTab('SUBSCRIPTIONS'); }} className={`flex flex-col items-center transition-all active:scale-90 ${activeView === 'HOME' ? 'text-green-600' : 'text-gray-400'}`}>
          <svg className="w-6 h-6" fill={activeView === 'HOME' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-[8px] font-bold uppercase mt-1">Home</span>
        </button>
        <button onClick={() => setActiveView('REWARDS')} className={`flex flex-col items-center transition-all active:scale-90 ${activeView === 'REWARDS' ? 'text-green-600' : 'text-gray-400'}`}>
          <svg className="w-6 h-6" fill={activeView === 'REWARDS' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 18V7l10 11V7M5 10h14M5 14h14" />
          </svg>
          <span className="text-[8px] font-bold uppercase mt-1">Rewards</span>
        </button>
        <button onClick={() => setActiveView('RECIPES')} className={`flex flex-col items-center transition-all active:scale-90 ${activeView === 'RECIPES' ? 'text-green-600' : 'text-gray-400'}`}>
          <svg className="w-6 h-6" fill={activeView === 'RECIPES' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          <span className="text-[8px] font-bold uppercase mt-1">Recipes</span>
        </button>
        <button onClick={() => setActiveView('PROFILE')} className={`flex flex-col items-center transition-all active:scale-90 ${activeView === 'PROFILE' ? 'text-green-600' : 'text-gray-400'}`}>
          <svg className="w-6 h-6" fill={activeView === 'PROFILE' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="text-[8px] font-bold uppercase mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default CustomerDashboard;