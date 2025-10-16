import { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  const Icon = type === 'success' ? CheckCircle : AlertTriangle;

  return (
    <div className={`fixed bottom-5 right-5 flex items-center p-4 rounded-lg text-white shadow-lg ${bgColor} animate-fade-in-up`}>
      <Icon className="h-5 w-5 mr-3" />
      <span className="flex-grow">{message}</span>
      <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-black/20">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
