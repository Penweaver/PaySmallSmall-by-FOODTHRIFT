
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { MOCK_PLANS } from '../constants';
import { FoodPlan, PlanFrequency } from '../types';
import { analyzeContributionTrends } from '../services/geminiService';
import { ToastMessage } from '../components/Toast';

const REVENUE_DATA = [
  { name: 'Mon', amount: 450000 },
  { name: 'Tue', amount: 890000 },
  { name: 'Wed', amount: 1200000 },
  { name: 'Thu', amount: 1100000 },
  { name: 'Fri', amount: 1900000 },
  { name: 'Sat', amount: 2400000 },
  { name: 'Sun', amount: 2800000 },
];

interface AdminDashboardProps {
  addToast: (msg: string, type?: ToastMessage['type']) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ addToast }) => {
  const [plans, setPlans] = useState<FoodPlan[]>(() => {
    const saved = localStorage.getItem('ft_plans');
    return saved ? JSON.parse(saved) : MOCK_PLANS;
  });

  const [deactivatedPlans, setDeactivatedPlans] = useState<FoodPlan[]>(() => {
    const saved = localStorage.getItem('ft_archived_plans');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('ft_plans', JSON.stringify(plans));
    localStorage.setItem('ft_archived_plans', JSON.stringify(deactivatedPlans));
  }, [plans, deactivatedPlans]);

  const [selectedPlan, setSelectedPlan] = useState<FoodPlan | null>(null);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(true);
  const [aiBriefing, setAiBriefing] = useState("");
  
  const [newPlan, setNewPlan] = useState<Partial<FoodPlan>>({
    name: '', 
    category: 'Foodstuff', 
    amount: 0, 
    frequency: PlanFrequency.WEEKLY, 
    durationInWeeks: 12, 
    imageUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=400'
  });

  useEffect(() => {
    const fetchBriefing = async () => {
      setIsAiLoading(true);
      const report = await analyzeContributionTrends(plans);
      setAiBriefing(report);
      setIsAiLoading(false);
    };
    fetchBriefing();
  }, [plans]);

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.name || !newPlan.amount) {
      addToast("Please fill required fields", "ERROR");
      return;
    }
    const p: FoodPlan = { 
      ...newPlan as FoodPlan, 
      id: `plan_${Date.now()}` 
    };
    setPlans([p, ...plans]);
    setShowAddPlan(false);
    addToast(`Plan "${p.name}" successfully added`);
    setNewPlan({
      name: '', category: 'Foodstuff', amount: 0, frequency: PlanFrequency.WEEKLY, durationInWeeks: 12, imageUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=400'
    });
  };

  const handleArchive = (plan: FoodPlan) => {
    setPlans(plans.filter(p => p.id !== plan.id));
    setDeactivatedPlans([{ ...plan, deactivationReason: 'Rotation' }, ...deactivatedPlans]);
    setSelectedPlan(null);
    addToast(`Plan "${plan.name}" Deactivated`, "INFO");
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Contributions', value: '₦12.8M', trend: '+12%', color: 'text-green-600' },
          { label: 'Active Plans', value: plans.length.toString(), trend: 'Stable', color: 'text-gray-900' },
          { label: 'System Status', value: 'Online', trend: 'Optimum', color: 'text-blue-600' },
          { label: 'Active Users', value: '842', trend: 'Growing', color: 'text-purple-600' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{stat.label}</p>
            <div className="flex justify-between items-baseline">
              <p className={`text-2xl font-bold ${stat.color} tracking-tight`}>{stat.value}</p>
              <span className="text-[9px] font-bold text-gray-300 uppercase">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Insights */}
        <div className="lg:col-span-2 bg-gray-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl flex flex-col justify-between min-h-[300px]">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-green-400">
                System Insights
              </h2>
              <span className="text-[9px] font-bold text-gray-500 uppercase">AI Advisor</span>
            </div>
            {isAiLoading ? (
              <div className="space-y-3">
                <div className="h-4 w-3/4 bg-white/5 animate-pulse rounded"></div>
                <div className="h-4 w-1/2 bg-white/5 animate-pulse rounded"></div>
              </div>
            ) : (
              <p className="text-xl font-medium leading-relaxed text-gray-200">
                {aiBriefing}
              </p>
            )}
          </div>
          <div className="relative z-10 pt-6 flex space-x-4">
             <div className="text-[9px] font-bold text-gray-500 uppercase px-3 py-1 bg-white/5 rounded-full border border-white/5">Risk Level: Low</div>
             <div className="text-[9px] font-bold text-gray-500 uppercase px-3 py-1 bg-white/5 rounded-full border border-white/5">Activity: High</div>
          </div>
        </div>

        {/* Weekly Revenue Graph */}
        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payments (Last 7 Days)</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">₦2.8M</p>
          </div>
          <div className="flex-1 min-h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ fontSize: '10px', fontWeight: '700' }}
                  labelStyle={{ display: 'none' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#22c55e" fillOpacity={1} fill="url(#colorAmt)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Food Plan Catalog</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Manage active listings and stock</p>
        </div>
        <button 
          onClick={() => setShowAddPlan(true)} 
          className="px-8 py-4 bg-gray-900 text-white rounded-xl text-[10px] font-bold uppercase shadow-lg hover:bg-black transition-all"
        >
          Add New Plan
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Plans</h3>
            <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[9px] font-bold uppercase">{plans.length} Listings</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 max-h-[600px] overflow-y-auto pr-2">
            {plans.map(p => (
              <div key={p.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 group transition-all hover:bg-white hover:shadow-lg">
                <div className="relative mb-4 overflow-hidden rounded-xl">
                  <img src={p.imageUrl} className="w-full aspect-video object-cover" alt={p.name} />
                  <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 rounded-md text-[8px] font-bold text-gray-900 uppercase">{p.category}</div>
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">{p.name}</h4>
                <p className="text-[10px] font-medium text-gray-400 uppercase mb-4">₦{p.amount.toLocaleString()} / Installment</p>
                <div className="flex space-x-2">
                   <button 
                     onClick={() => setSelectedPlan(p)}
                     className="flex-1 py-3 bg-white border border-gray-200 text-gray-900 rounded-lg text-[9px] font-bold uppercase"
                   >
                     Manage
                   </button>
                   <button 
                     onClick={() => handleArchive(p)}
                     className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-6">Archived Plans</h3>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {deactivatedPlans.length === 0 ? (
              <p className="text-[10px] font-medium text-gray-300 italic text-center py-10">No archived plans.</p>
            ) : (
              deactivatedPlans.map(p => (
                <div key={p.id} className="p-4 bg-white border border-gray-100 rounded-xl grayscale opacity-60">
                  <p className="text-[10px] font-bold text-gray-900">{p.name}</p>
                  <p className="text-[8px] font-bold text-red-500 uppercase mt-1">Inactive</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Plan Modal */}
      {showAddPlan && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl p-8 animate-scaleIn">
            <div className="flex justify-between items-start mb-6">
               <h3 className="text-xl font-bold text-gray-900">Add New Food Plan</h3>
               <button onClick={() => setShowAddPlan(false)} className="text-gray-400 hover:text-gray-900">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
            <form onSubmit={handleAddPlan} className="space-y-4">
              <input required placeholder="Plan Name" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-green-500" onChange={e => setNewPlan({...newPlan, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" placeholder="Cost (₦)" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-green-500" onChange={e => setNewPlan({...newPlan, amount: Number(e.target.value)})} />
                <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-green-500" onChange={e => setNewPlan({...newPlan, category: e.target.value as any})}>
                  <option>Foodstuff</option>
                  <option>Livestock</option>
                  <option>Meat</option>
                  <option>Bundle</option>
                </select>
              </div>
              <input required placeholder="Image URL" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-green-500" onChange={e => setNewPlan({...newPlan, imageUrl: e.target.value})} />
              <button className="w-full py-4 bg-gray-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider mt-2">Confirm Plan</button>
            </form>
          </div>
        </div>
      )}

      {selectedPlan && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl p-8 text-center animate-scaleIn">
            <button onClick={() => setSelectedPlan(null)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900">×</button>
            <div className="mb-6">
              <img src={selectedPlan.imageUrl} className="w-20 h-20 rounded-2xl mx-auto mb-4 object-cover border-2 border-white shadow-md" alt="" />
              <h3 className="text-lg font-bold text-gray-900">{selectedPlan.name}</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedPlan.category}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="p-3 bg-gray-50 rounded-xl">
                 <p className="text-[8px] font-bold text-gray-400 uppercase">Subscribers</p>
                 <p className="text-lg font-bold text-gray-900">142</p>
               </div>
               <div className="p-3 bg-gray-50 rounded-xl">
                 <p className="text-[8px] font-bold text-gray-400 uppercase">Total Saved</p>
                 <p className="text-lg font-bold text-green-600">₦710k</p>
               </div>
            </div>

            <button onClick={() => handleArchive(selectedPlan)} className="w-full py-4 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold uppercase border border-red-100 hover:bg-red-600 hover:text-white transition-all">Deactivate Plan</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
