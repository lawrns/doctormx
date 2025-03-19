import React, { useState } from 'react';
import Modal from './Modal';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (email: string) => void;
  title?: string;
  description?: string;
  imageUrl?: string;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSubscribe,
  title = '¡No te vayas todavía!',
  description = 'Recibe recomendaciones personalizadas de médicos especialistas y promociones exclusivas.',
  imageUrl = '/images/subscription-doctor.jpg',
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }
    
    setError('');
    onSubscribe(email);
    setEmail('');
    onClose();
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      closeOnClickOutside={false}
    >
      <div className="flex flex-col md:flex-row items-center">
        {imageUrl && (
          <div className="md:w-2/5 mb-4 md:mb-0 md:mr-6">
            <img
              src={imageUrl}
              alt="Subscripción"
              className="rounded-lg w-full h-auto object-cover"
            />
          </div>
        )}
        
        <div className={imageUrl ? 'md:w-3/5' : 'w-full'}>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {title}
          </h3>
          
          <p className="text-gray-600 mb-4">
            {description}
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {error && (
                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={onClose}
              >
                No gracias
              </button>
              <button
                type="submit"
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Suscribirme
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default SubscriptionModal;