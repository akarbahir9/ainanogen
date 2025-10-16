import { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const toastConfig = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5 text-green-400" />,
    style: 'bg-gray-800 border-green-500/50',
  },
  error: {
    icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
    style: 'bg-gray-800 border-red-500/50',
  },
};

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const config = toastConfig[type];

  return (
    <div
      className={cn(
        'fixed bottom-5 right-5 z-50 w-full max-w-sm p-4 rounded-lg shadow-lg border animate-fade-in-up',
        config.style
      )}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{config.icon}</div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-100">{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={onClose}
            className="inline-flex rounded-md text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
