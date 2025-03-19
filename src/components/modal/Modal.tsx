import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnClickOutside?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnClickOutside = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (isOpen && event.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);
  
  // Prevent scrolling of background when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Handle click outside
  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
    if (
      closeOnClickOutside &&
      modalRef.current &&
      !modalRef.current.contains(event.target as Node)
    ) {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full',
  };
  
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4"
      onClick={handleClickOutside}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div 
        ref={modalRef}
        className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} animate-slide-in-up`}
      >
        {title && (
          <div className="border-b px-6 py-4">
            <h3 id="modal-title" className="text-lg font-medium text-gray-900">
              {title}
            </h3>
          </div>
        )}
        
        <div className="p-6">
          {children}
        </div>
        
        {footer && (
          <div className="border-t px-6 py-4">
            {footer}
          </div>
        )}
        
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <svg 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Modal;