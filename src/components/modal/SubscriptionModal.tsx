import React, { useState } from 'react';
import Modal, { ModalProps } from './Modal';

interface SubscriptionModalProps extends Omit<ModalProps, 'children' | 'title'> {
  onSubscribe?: (email: string) => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSubscribe,
  ...props
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Por favor, ingresa tu correo electrónico');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Call the subscription handler
      onSubscribe?.(email);
      
      // Close the modal after successful subscription
      onClose();
    } catch (err) {
      setError('Hubo un error al suscribirte. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="No te pierdas a los mejores médicos"
      {...props}
    >
      <div className="py-2">
        <p className="mb-4 text-gray-600">
          Déjanos tu correo y recíbelo en tu bandeja de entrada cuando se unan nuevos especialistas.
        </p>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Tu correo electrónico"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Enviando...' : 'Recibir notificaciones'}
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default SubscriptionModal;