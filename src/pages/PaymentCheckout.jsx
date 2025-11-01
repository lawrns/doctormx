import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from '../lib/toast';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Icon from '../components/ui/Icon';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';

// Load Stripe outside component
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// CheckoutForm component using Elements
const CheckoutForm = ({ amount, description, onSuccess }) => {
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setErrorMessage('');

    if (!stripe || !elements) {
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        setErrorMessage(error.message);
        setProcessing(false);
        return;
      }

      // Get clientSecret from parent component or create new intent
      const response = await fetch('/api/payments/intent', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to centavos
          description,
          customerEmail: user?.email || '',
          paymentMethodId: paymentMethod.id,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setErrorMessage(data.error);
        setProcessing(false);
        return;
      }

      const clientSecret = data.clientSecret || data.paymentIntentId;

      const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id,
      });

      if (stripeError) {
        setErrorMessage(stripeError.message);
      } else {
        onSuccess();
      }
    } catch (err) {
        setErrorMessage(err.message || 'Ocurrió un error procesando el pago');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border border-gray-300 rounded-lg p-4">
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                fontFamily: 'Inter, system-ui, sans-serif',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#fa755a',
              },
            },
          }} 
        />
      </div>
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {errorMessage}
        </div>
      )}
      <button 
        type="submit" 
        disabled={!stripe || !elements || processing}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
      >
        {processing ? 'Procesando...' : `Pagar $${amount} MXN`}
      </button>
    </form>
  );
};

// Main component
export default function PaymentCheckout() {
  const { user } = useAuth();
  const [amount, setAmount] = useState(500); // Default consultation fee
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get amount from URL params or use default
    const urlParams = new URLSearchParams(window.location.search);
    const amountParam = urlParams.get('amount');
    if (amountParam) {
      setAmount(parseFloat(amountParam));
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const createPaymentIntent = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        // Create payment intent on mount
        const response = await fetch('/api/payments/intent', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({ 
            amount: Math.round((amount - 50) * 100), // Convert to centavos and apply discount
            description: 'Consulta médica - Doctor.mx',
            customerEmail: user.email 
          }),
        });
        
        const data = await response.json();
        if (data.error) {
          setError(data.error);
        } else {
          setClientSecret(data.clientSecret || data.paymentIntentId);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    createPaymentIntent();
  }, [amount, user]);

  const appearance = {
    theme: 'stripe',
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4">Pago Seguro</h1>
          <p className="mb-6">Monto: ${amount} MXN</p>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando...</p>
            </div>
          ) : clientSecret ? (
            <Elements stripe={stripePromise} options={options}>
              <CheckoutForm amount={amount - 50} description="Consulta médica - Doctor.mx" onSuccess={() => {
                toast.success('Pago exitoso');
                window.location.href = '/dashboard';
              }} />
            </Elements>
          ) : (
            <div className="text-center py-8 text-red-600">
              No se pudo crear la sesión de pago. Por favor, intenta de nuevo.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}