import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from '../lib/toast';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import Icon from '../components/ui/Icon';
import Layout from '../components/Layout';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function PaymentCheckout() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [checkoutSession, setCheckoutSession] = useState(null);
  const [amount, setAmount] = useState(500); // Default consultation fee

  useEffect(() => {
    // Get amount from URL params or use default
    const urlParams = new URLSearchParams(window.location.search);
    const amountParam = urlParams.get('amount');
    if (amountParam) {
      setAmount(parseFloat(amountParam));
    }
  }, []);

  const handleStripeCheckout = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          description: `Consulta médica - Doctor.mx`,
          customerEmail: user?.email || '',
          customerName: user?.user_metadata?.full_name || '',
          metadata: {
            user_id: user?.id || '',
            consultation_type: 'general'
          },
          successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/payment/cancel`
        })
      });

      if (!response.ok) {
        throw new Error('Error al crear la sesión de pago');
      }

      const session = await response.json();
      setCheckoutSession(session);

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.checkoutSessionId
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleOXXOPayment = async () => {
    try {
      setLoading(true);
      
      // For OXXO, we'll create a payment intent and show a barcode
      const response = await fetch('/api/payments/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          description: `Consulta médica - Doctor.mx (OXXO)`,
          customerEmail: user?.email || '',
          customerName: user?.user_metadata?.full_name || '',
          metadata: {
            user_id: user?.id || '',
            payment_method: 'oxxo',
            consultation_type: 'general'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Error al crear el pago OXXO');
      }

      const paymentIntent = await response.json();
      
      // In a real implementation, you would show the OXXO barcode
      // For now, we'll simulate success
      toast.success('Código OXXO generado. Redirigiendo...');
      
      setTimeout(() => {
        window.location.href = `/payment/oxxo?intent=${paymentIntent.paymentIntentId}`;
      }, 1500);
    } catch (error) {
      console.error('Error creating OXXO payment:', error);
      toast.error('Error al procesar el pago OXXO');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (paymentMethod === 'card') {
      await handleStripeCheckout();
    } else if (paymentMethod === 'oxxo') {
      await handleOXXOPayment();
    }
  };

  return (
    <Layout variant="marketing">
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Finalizar Pago
            </h1>
            <p className="text-gray-600">
              Completa tu pago para acceder a la consulta médica
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">
              Resumen de la Consulta
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-blue-700">Consulta Médica General</span>
                <span className="font-semibold text-blue-900">${amount.toFixed(2)} MXN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Descuento por primera consulta</span>
                <span className="text-green-600">-$50.00 MXN</span>
              </div>
              <div className="border-t border-blue-200 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-blue-900">Total</span>
                  <span className="text-blue-900">${(amount - 50).toFixed(2)} MXN</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handlePayment} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Método de Pago
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border rounded-lg text-center transition-colors ${
                    paymentMethod === 'card'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">💳</div>
                  <div className="text-sm font-medium">Tarjeta</div>
                  <div className="text-xs text-gray-500 mt-1">Visa, Mastercard</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('oxxo')}
                  className={`p-4 border rounded-lg text-center transition-colors ${
                    paymentMethod === 'oxxo'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">🏪</div>
                  <div className="text-sm font-medium">OXXO</div>
                  <div className="text-xs text-gray-500 mt-1">Efectivo</div>
                </button>
              </div>
            </div>

            {paymentMethod === 'card' && (
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="text-center">
                  <div className="text-primary-600 mb-4">
                    <Icon name="shield-check" size="xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Pago Seguro con Stripe
                  </h3>
                  <p className="text-blue-700 text-sm mb-4">
                    Serás redirigido a Stripe para completar el pago de forma segura
                  </p>
                  <div className="bg-white rounded-lg p-4 border-2 border-dashed border-blue-300">
                    <div className="text-blue-600 text-sm">
                      No almacenamos información de tu tarjeta
                    </div>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'oxxo' && (
              <div className="bg-orange-50 rounded-lg p-6">
                <div className="text-center">
                  <div className="text-4xl mb-4">🏪</div>
                  <h3 className="text-lg font-semibold text-orange-900 mb-2">
                    Pago en OXXO
                  </h3>
                  <p className="text-orange-700 text-sm mb-4">
                    Recibirás un código de barras para pagar en cualquier tienda OXXO
                  </p>
                  <div className="bg-white rounded-lg p-4 border-2 border-dashed border-orange-300">
                    <div className="text-orange-600 text-sm">
                      El código aparecerá después de confirmar el pago
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1"
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  Acepto los{' '}
                  <a href="/terms" className="text-blue-600 hover:text-blue-700">
                    términos y condiciones
                  </a>{' '}
                  y la{' '}
                  <a href="/privacy" className="text-blue-600 hover:text-blue-700">
                    política de privacidad
                  </a>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Procesando...
                </div>
              ) : (
                `Pagar $${(amount - 50).toFixed(2)} MXN`
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              <Icon name="shield-check" size="sm" className="inline mr-1" />
              Tu información está protegida con encriptación SSL
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Powered by Stripe • Aceptamos Visa, Mastercard, American Express
            </p>
          </div>
        </motion.div>
        </div>
      </div>
    </Layout>
  );
}