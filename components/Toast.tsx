import React from 'react';
import { ToastMessage } from '../types';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../utils';

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex items-center gap-3 min-w-[300px] p-4 rounded-xl shadow-lg border backdrop-blur-md animate-slide-up transition-all",
            toast.type === 'success' && "bg-green-50/90 dark:bg-green-900/40 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
            toast.type === 'error' && "bg-red-50/90 dark:bg-red-900/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
            toast.type === 'info' && "bg-blue-50/90 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"
          )}
        >
          {toast.type === 'success' && <CheckCircle size={20} />}
          {toast.type === 'error' && <AlertCircle size={20} />}
          {toast.type === 'info' && <Info size={20} />}
          
          <div className="flex-1 text-sm font-medium">{toast.message}</div>
          
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="text-xs font-bold underline px-2 py-1 hover:opacity-80"
            >
              {toast.action.label}
            </button>
          )}
          
          <button onClick={() => removeToast(toast.id)} className="opacity-60 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};