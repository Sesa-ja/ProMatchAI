import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

function ToastItem({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-orange-500" />,
  };

  const colors = {
    success: 'border-l-4 border-green-500 bg-green-50',
    error: 'border-l-4 border-red-500 bg-red-50',
    info: 'border-l-4 border-blue-500 bg-blue-50',
    warning: 'border-l-4 border-orange-500 bg-orange-50',
  };

  return (
    <div
      className={`${colors[toast.type]} rounded-lg shadow-lg p-4 mb-3 flex items-start gap-3 animate-slide-in-right max-w-md`}
    >
      {icons[toast.type]}
      <div className="flex-1">
        {toast.title && (
          <h4 className="text-sm text-gray-900 mb-1">{toast.title}</h4>
        )}
        <p className="text-sm text-gray-700">{toast.description}</p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}

// Hook for using toasts
let toastId = 0;
const listeners: Array<(toast: Toast) => void> = [];

export const toast = {
  success: (description: string, title?: string) => {
    const newToast: Toast = {
      id: `toast-${toastId++}`,
      type: 'success',
      description,
      title,
    };
    listeners.forEach((listener) => listener(newToast));
  },
  error: (description: string, title?: string) => {
    const newToast: Toast = {
      id: `toast-${toastId++}`,
      type: 'error',
      description,
      title,
    };
    listeners.forEach((listener) => listener(newToast));
  },
  info: (description: string, title?: string) => {
    const newToast: Toast = {
      id: `toast-${toastId++}`,
      type: 'info',
      description,
      title,
    };
    listeners.forEach((listener) => listener(newToast));
  },
  warning: (description: string, title?: string) => {
    const newToast: Toast = {
      id: `toast-${toastId++}`,
      type: 'warning',
      description,
      title,
    };
    listeners.forEach((listener) => listener(newToast));
  },
};

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);
    };
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, removeToast };
}
