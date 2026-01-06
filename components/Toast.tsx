
import React, { useEffect } from 'react';

export interface ToastMessage {
  id: string;
  type: 'SUCCESS' | 'ERROR' | 'INFO';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-6 right-6 z-[999] space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: () => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(onRemove, 4000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const colors = {
    SUCCESS: 'bg-green-600 text-white shadow-green-200',
    ERROR: 'bg-red-600 text-white shadow-red-200',
    INFO: 'bg-gray-900 text-white shadow-gray-200',
  };

  return (
    <div className={`${colors[toast.type]} pointer-events-auto px-6 py-4 rounded-[24px] shadow-2xl flex items-center space-x-4 animate-slideInRight max-w-sm border border-white/10`}>
      <div className="flex-shrink-0">
        {toast.type === 'SUCCESS' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>}
        {toast.type === 'ERROR' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>}
        {toast.type === 'INFO' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
      </div>
      <p className="text-[11px] font-black uppercase tracking-widest leading-none">{toast.message}</p>
      <button onClick={onRemove} className="text-white/50 hover:text-white transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
  );
};

export default Toast;
