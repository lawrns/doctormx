import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { supabase } from '../lib/supabase';
import { toast } from '../lib/toast';

export default function DoctorSubscriptionManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [canceling, setCanceling] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/connect/login');
        return;
      }

      // Fetch subscription status
      const subscriptionResponse = await fetch(`/api/doctors/${user.id}/subscription`);
      const subscriptionData = await subscriptionResponse.json();
      
      if (subscriptionResponse.ok) {
        setSubscription(subscriptionData);
      }

      // Fetch available plans
      const plansResponse = await fetch('/api/subscription-plans');
      const plansData = await plansResponse.json();
      
      if (plansResponse.ok) {
        setPlans(plansData);
      }

    } catch (error) {
      console.error('Error fetching subscription data:', error);
      setError('Error al cargar la información de suscripción');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('¿Estás seguro de que quieres cancelar tu suscripción? Podrás seguir usando la plataforma hasta el final del período de facturación.')) {
      return;
    }

    try {
      setCanceling(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      const response = await fetch(`/api/doctors/${user.id}/subscription/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: 'user_requested' }),
      });

      const result = await response.json();
      
      if (response.ok) {
        toast.success('Suscripción cancelada exitosamente');
        await fetchSubscriptionData(); // Refresh data
      } else {
        throw new Error(result.error || 'Error al cancelar suscripción');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error(`Error al cancelar suscripción: ${error.message}`);
    } finally {
      setCanceling(false);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    // This would integrate with Stripe Elements for payment method update
    toast.info('Funcionalidad de actualización de método de pago próximamente');
  };

  const formatCurrency = (amount, currency = 'MXN') => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Layout variant="app">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout variant="app">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestión de Suscripción
            </h1>
            <p className="text-gray-600">
              Administra tu suscripción y método de pago
            </p>
          </div>

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          {/* Current Subscription */}
          {subscription && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Suscripción Actual
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        subscription.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : subscription.status === 'canceling'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {subscription.status === 'active' && 'Activa'}
                        {subscription.status === 'canceling' && 'Cancelando'}
                        {subscription.status === 'canceled' && 'Cancelada'}
                        {subscription.status === 'payment_failed' && 'Pago Fallido'}
                      </span>
                      {subscription.plan && (
                        <span className="text-sm text-gray-600">
                          {subscription.plan.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {subscription.plan && (
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(subscription.amount)}
                      </div>
                    )}
                    <div className="text-sm text-gray-500">
                      {subscription.plan?.interval === 'month' ? 'por mes' : 'por año'}
                    </div>
                  </div>
                </div>

                {/* Subscription Details */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Detalles de Facturación</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Próxima facturación:</span>
                        <span className="font-medium">
                          {subscription.nextBillingDate 
                            ? formatDate(subscription.nextBillingDate)
                            : 'N/A'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <span className="font-medium capitalize">
                          {subscription.status}
                        </span>
                      </div>
                      {subscription.cancelAtPeriodEnd && (
                        <div className="flex justify-between text-yellow-600">
                          <span>Cancelación programada:</span>
                          <span className="font-medium">
                            {subscription.nextBillingDate 
                              ? formatDate(subscription.nextBillingDate)
                              : 'N/A'
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Beneficios Incluidos</h3>
                    <div className="space-y-2 text-sm">
                      {subscription.plan?.features?.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Icon name="check-circle" size="sm" color="success" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handleUpdatePaymentMethod}
                    disabled={updating}
                  >
                    <Icon name="credit-card" size="sm" className="mr-2" />
                    Actualizar Método de Pago
                  </Button>
                  
                  {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
                    <Button
                      variant="outline"
                      color="warning"
                      onClick={handleCancelSubscription}
                      disabled={canceling}
                    >
                      <Icon name="x-circle" size="sm" className="mr-2" />
                      {canceling ? 'Cancelando...' : 'Cancelar Suscripción'}
                    </Button>
                  )}
                  
                  {subscription.status === 'payment_failed' && (
                    <Button
                      variant="primary"
                      onClick={handleUpdatePaymentMethod}
                    >
                      <Icon name="credit-card" size="sm" className="mr-2" />
                      Actualizar Método de Pago
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Available Plans */}
          {plans.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Planes Disponibles
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {plans.map((plan, index) => (
                  <Card key={plan.id} className="p-6 relative">
                    {plan.id === 'doctor_yearly' && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Más Popular
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {plan.name}
                      </h3>
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {formatCurrency(plan.price)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {plan.interval === 'month' ? 'por mes' : 'por año'}
                      </div>
                      {plan.id === 'doctor_yearly' && (
                        <div className="text-sm text-green-600 font-medium mt-2">
                          Ahorra $998 MXN (2 meses gratis)
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start gap-2">
                          <Icon name="check-circle" size="sm" color="success" className="mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant={plan.id === 'doctor_yearly' ? 'primary' : 'outline'}
                      className="w-full"
                      onClick={() => {
                        if (subscription?.status === 'active') {
                          toast.info('Ya tienes una suscripción activa');
                        } else {
                          navigate('/connect/signup');
                        }
                      }}
                    >
                      {subscription?.status === 'active' ? 'Plan Actual' : 'Seleccionar Plan'}
                    </Button>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ¿Necesitas Ayuda?
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Contacto de Soporte</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Nuestro equipo está disponible 24/7 para ayudarte con cualquier pregunta sobre tu suscripción.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Icon name="envelope" size="sm" color="secondary" />
                      <span>soporte@doctor.mx</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="phone" size="sm" color="secondary" />
                      <span>+52 55 1234 5678</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Preguntas Frecuentes</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Icon name="information-circle" size="sm" color="secondary" />
                      <span>¿Cómo cancelo mi suscripción?</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="information-circle" size="sm" color="secondary" />
                      <span>¿Puedo cambiar de plan?</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="information-circle" size="sm" color="secondary" />
                      <span>¿Qué métodos de pago aceptan?</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}