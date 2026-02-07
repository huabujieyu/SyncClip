import { useState, useCallback } from 'react';
import { ToastMessage } from '../types';
import { generateId } from '../utils';

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: 'success' | 'error' | 'info', message: string, action?: { label: string; onClick: () => void }) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, type, message, action }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  return { toasts, addToast, removeToast };
}