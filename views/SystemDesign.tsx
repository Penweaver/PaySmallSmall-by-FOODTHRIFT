
import React from 'react';

const SystemDesign: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fadeIn pb-20">
      <section>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-green-100">S</div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">How it Works</h1>
        </div>
        <p className="text-gray-600 leading-relaxed font-medium">
          PaySmallSmall is built to make food security accessible. Our system ensures that your contributions are directly linked to the specific food plans you choose, providing a transparent and secure way to save.
        </p>
        
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="text-green-600 font-bold text-[10px] uppercase tracking-widest mb-4">01. Direct Payments</div>
            <p className="text-xs text-gray-500 leading-relaxed">Payments are processed through leading providers like Paystack and Flutterwave, ensuring your funds are safe.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="text-green-600 font-bold text-[10px] uppercase tracking-widest mb-4">02. Automated Tracking</div>
            <p className="text-xs text-gray-500 leading-relaxed">Every payment is instantly recorded against your plan, giving you a real-time view of your food savings.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="text-green-600 font-bold text-[10px] uppercase tracking-widest mb-4">03. Secure Fulfillment</div>
            <p className="text-xs text-gray-500 leading-relaxed">Once a plan is completed, our logistics team handles the procurement and delivery of your food assets.</p>
          </div>
        </div>
      </section>

      <section className="bg-gray-900 text-white rounded-[40px] p-10 shadow-xl relative overflow-hidden">
        <h2 className="text-2xl font-bold mb-8 tracking-tight">Payment Security</h2>
        <div className="space-y-6">
          <div className="flex items-start space-x-6">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex-shrink-0 flex items-center justify-center font-bold text-green-400 border border-white/5">01</div>
            <div>
              <h4 className="font-bold text-[11px] uppercase tracking-widest text-green-400 mb-1">Instant Verification</h4>
              <p className="text-sm text-gray-400 font-medium">We use real-time webhooks to confirm every transaction, ensuring your dashboard is always up to date.</p>
            </div>
          </div>
          <div className="flex items-start space-x-6">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex-shrink-0 flex items-center justify-center font-bold text-green-400 border border-white/5">02</div>
            <div>
              <h4 className="font-bold text-[11px] uppercase tracking-widest text-green-400 mb-1">Secure Transactions</h4>
              <p className="text-sm text-gray-400 font-medium">Unique references for every payment prevent duplication and ensure error-free reconciliation.</p>
            </div>
          </div>
          <div className="flex items-start space-x-6">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex-shrink-0 flex items-center justify-center font-bold text-green-400 border border-white/5">03</div>
            <div>
              <h4 className="font-bold text-[11px] uppercase tracking-widest text-green-400 mb-1">Transparent Audit</h4>
              <p className="text-sm text-gray-400 font-medium">Full transaction logs are available for both users and administrators to ensure complete accountability.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-green-50 border border-green-200 rounded-3xl p-10">
        <h2 className="text-xl font-bold text-green-900 mb-6 uppercase tracking-widest text-center">Safety Standards</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[
            "Secure Payments",
            "Data Privacy",
            "SSL Encrypted",
            "KYC Compliant",
            "Anti-Fraud",
            "Verified Vendors"
          ].map((item, i) => (
            <div key={i} className="bg-white/50 p-4 rounded-xl border border-green-100 flex items-center space-x-3">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              <span className="text-[10px] font-bold uppercase text-green-800 tracking-wider">{item}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SystemDesign;
