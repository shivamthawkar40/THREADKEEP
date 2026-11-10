import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', title = '') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type, title }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-teal" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-gold-dark" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-coral-dark" />;
      default:
        return <Info className="w-5 h-5 text-teal" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-teal bg-mint-light';
      case 'warning':
        return 'border-gold bg-amber-50/70';
      case 'error':
        return 'border-coral bg-rose-50/70';
      default:
        return 'border-sage bg-ivory';
    }
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start p-3.5 rounded-lg border shadow-card transition-all duration-300 animate-slide-up ${getBorderColor(
              toast.type
            )}`}
          >
            <div className="flex-shrink-0 mr-3 mt-0.5">{getIcon(toast.type)}</div>
            <div className="flex-1 mr-2">
              {toast.title && (
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                  {toast.title}
                </h4>
              )}
              <p className="text-sm font-medium text-charcoal leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-charcoal-light hover:text-charcoal p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
