import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastNotificationsProps {
  toasts: Toast[];
  removeToast: (id: number) => void;
}

const ToastNotifications: React.FC<ToastNotificationsProps> = ({ toasts, removeToast }) => {
  useEffect(() => {
    const timers = toasts.map((toast) =>
      setTimeout(() => {
        removeToast(toast.id);
      }, 3000)
    );

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [toasts, removeToast]);

  const renderIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-green-500" />;
      case 'error':
        return <FaExclamationCircle className="text-red-500" />;
      case 'info':
        return <FaInfoCircle className="text-yellow-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed top-32 right-4 z-50 flex flex-col gap-4"> 
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center justify-between p-4 mb-4 rounded shadow-md bg-white text-gray-800 animate-slideInRight ${toast.type === 'success' ? 'border-l-4 border-green-500' : ''} ${toast.type === 'error' ? 'border-l-4 border-red-500' : ''} ${toast.type === 'info' ? 'border-l-4 border-blue-500' : ''}`}
        >
          <div className="flex items-center">
            {renderIcon(toast.type)}
            <p className="ml-2">{toast.message}</p>
          </div>
          <button onClick={() => removeToast(toast.id)}>
            <IoMdClose className="text-left" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastNotifications;
