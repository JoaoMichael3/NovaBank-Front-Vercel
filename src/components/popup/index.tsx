import React, { useEffect } from 'react';
import { PopupProps } from './types';

const Popup: React.FC<PopupProps> = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  ">
      <div
        className="fixed inset-0 bg-black opacity-50 transition-opacity overflow-none "
        onClick={onClose}
      ></div>
      <div className="relative bg-[#1a202c]   rounded-lg  z-50 fade-in max-h-[80vh] overflow-none  w-auto">
        <button
          className="absolute top-0 right-0 m-4 text-[#ddd]"
          onClick={onClose}
        >
          &#10005;
        </button>
        <div className="overflow-auto max-h-[70vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Popup;
