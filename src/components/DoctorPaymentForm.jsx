import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Icon from './ui/Icon';
import Button from './ui/Button';
import Card from './ui/Card';
import Alert from './ui/Alert';
import LoadingSpinner from './ui/LoadingSpinner';
import { toast } from '../lib/toast';

export default function DoctorPaymentForm({ 
  planId, 
  planName, 
  amount, 
  currency = 'MXN',
  onSuccess,
  onCancel 
}) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState('method'); // method, details, processing, success

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  };

  const validateCardDetails = () => {
    const newErrors = {};
    
    if (!cardDetails.number || cardDetails.number.length < 16) {
      newErrors.number = 'Número de tarjeta inválido';
    }
    
    if (!cardDetails.expiry || !/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
      newErrors.expiry = 'Fecha de vencimiento inválida (MM/AA)';
    }
    
    if (!cardDetails.cvc || cardDetails.cvc.length < 3) {
      newErrors.cvc = 'CVC inválido';
    }
    
    if (!cardDetails.name.trim()) {
      newErrors.name = 'Nombre del titular requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    
    // Add spaces every 4 digits
    if (value.length > 4) {
      value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    
    setCardDetails(prev => ({ ...prev, number: value }));
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    
    // Add slash after 2 digits
    if (value.length > 2) {
      value = value.replace(/(\d{2})(\d)/, '$1/$2');
    }
    
    setCardDetails(prev => ({ ...prev, expiry: value }));
  };

  const handleCvcChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    
    setCardDetails(prev => ({ ...prev, cvc: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (paymentMethod === 'card' && !validateCardDetails()) {
      return;
    }
    
    setLoading(true);
    setStep('processing');
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would:
      // 1. Create Stripe payment method
      // 2. Create subscription with the payment method
      // 3. Handle 3D Secure if required
      
      setStep('success');
      toast.success('¡Pago procesado exitosamente!');
      
      if (onSuccess) {
        onSuccess({
          subscriptionId: 'sub_' + Math.random().toString(36).substr(2, 9),
          status: 'active'
        });
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Error al procesar el pago. Por favor, intenta de nuevo.');
      setStep('details');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="check-circle" size="xl" color="success" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          ¡Suscripción Activada!
        </h3>
        <p className="text-gray-600 mb-6">
          Tu suscripción a {planName} ha sido activada exitosamente.
        </p>
        <Button
          variant="primary"
          onClick={() => window.location.href = '/doctor-dashboard'}
        >
          Ir al Dashboard
        </Button>
      </motion.div>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Completar Suscripción
        </h2>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">{planName}</span>
          <span className="text-lg font-semibold text-gray-900">
            {formatCurrency(amount)}
          </span>
        </div>
      </div>

      {step === 'method' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className="font-medium text-gray-900 mb-4">
            Selecciona tu método de pago
          </h3>
          
          <div className="space-y-3 mb-6">
            <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-3"
              />
              <Icon name="credit-card" size="md" color="secondary" className="mr-3" />
              <div>
                <div className="font-medium text-gray-900">Tarjeta de Crédito/Débito</div>
                <div className="text-sm text-gray-500">Visa, Mastercard, American Express</div>
              </div>
            </label>
            
            <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
              <input
                type="radio"
                name="paymentMethod"
                value="oxxo"
                checked={paymentMethod === 'oxxo'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-3"
              />
              <Icon name="currency-dollar" size="md" color="secondary" className="mr-3" />
              <div>
                <div className="font-medium text-gray-900">Pago en OXXO</div>
                <div className="text-sm text-gray-500">Paga en efectivo en cualquier tienda OXXO</div>
              </div>
            </label>
            
            <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
              <input
                type="radio"
                name="paymentMethod"
                value="spei"
                checked={paymentMethod === 'spei'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-3"
              />
              <Icon name="banknotes" size="md" color="secondary" className="mr-3" />
              <div>
                <div className="font-medium text-gray-900">Transferencia SPEI</div>
                <div className="text-sm text-gray-500">Transferencia bancaria instantánea</div>
              </div>
            </label>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => setStep('details')}
              className="flex-1"
            >
              Continuar
            </Button>
          </div>
        </motion.div>
      )}

      {step === 'details' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {paymentMethod === 'card' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Titular
                </label>
                <input
                  type="text"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Como aparece en la tarjeta"
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Tarjeta
                </label>
                <input
                  type="text"
                  value={cardDetails.number}
                  onChange={handleCardNumberChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1234 5678 9012 3456"
                />
                {errors.number && <p className="text-red-600 text-sm mt-1">{errors.number}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vencimiento
                  </label>
                  <input
                    type="text"
                    value={cardDetails.expiry}
                    onChange={handleExpiryChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="MM/AA"
                  />
                  {errors.expiry && <p className="text-red-600 text-sm mt-1">{errors.expiry}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVC
                  </label>
                  <input
                    type="text"
                    value={cardDetails.cvc}
                    onChange={handleCvcChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123"
                  />
                  {errors.cvc && <p className="text-red-600 text-sm mt-1">{errors.cvc}</p>}
                </div>
              </div>
              
              <Alert variant="info" className="mt-4">
                <Icon name="shield-check" size="sm" className="mr-2" />
                Tus datos están protegidos con encriptación SSL de 256 bits
              </Alert>
              
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('method')}
                  className="flex-1"
                >
                  Atrás
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Procesando...' : 'Confirmar Pago'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8">
              <Icon name="information-circle" size="xl" color="secondary" className="mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Pago {paymentMethod === 'oxxo' ? 'en OXXO' : 'por SPEI'}
              </h3>
              <p className="text-gray-600 mb-6">
                {paymentMethod === 'oxxo' 
                  ? 'Recibirás un código de barras para pagar en cualquier tienda OXXO'
                  : 'Recibirás los datos bancarios para realizar la transferencia'
                }
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('method')}
                  className="flex-1"
                >
                  Atrás
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Generando...' : 'Generar Pago'}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {step === 'processing' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Procesando Pago
          </h3>
          <p className="text-gray-600">
            Por favor espera mientras procesamos tu suscripción...
          </p>
        </motion.div>
      )}
    </Card>
  );
}