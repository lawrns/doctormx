import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, Calendar, Check, ChevronDown, ChevronRight, CreditCard, Package } from 'lucide-react';
import SubscriptionService from '../../services/subscription/SubscriptionService';
import { SUBSCRIPTION_ADDONS } from '../../services/subscription/SubscriptionPlans';
import SubscriptionPlans from './SubscriptionPlans';

interface SubscriptionManagementProps {
  doctorId: string;
}

/**
 * Component for managing doctor subscriptions
 */
const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ doctorId }) => {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [changingPlan, setChangingPlan] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardName: ''
  });
  const [isYearly, setIsYearly] = useState(false);
  const [addOns, setAddOns] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [subscriptionHistory, setSubscriptionHistory] = useState<any[]>([]);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Fetch subscription on load
  useEffect(() => {
    fetchSubscription();
  }, [doctorId]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const data = await SubscriptionService.getDoctorSubscription(doctorId);
      setSubscription(data);
      
      // Also fetch history if we're showing it
      if (showHistory) {
        const history = await SubscriptionService.getDoctorSubscriptionHistory(doctorId);
        setSubscriptionHistory(history);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to load subscription details. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionHistory = async () => {
    try {
      const history = await SubscriptionService.getDoctorSubscriptionHistory(doctorId);
      setSubscriptionHistory(history);
    } catch (err) {
      console.error('Failed to load subscription history:', err);
    }
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setChangingPlan(true);
    
    // Reset add-ons when changing plan
    setAddOns([]);
  };

  const handleToggleAddOn = (addOnId: string) => {
    if (addOns.includes(addOnId)) {
      setAddOns(addOns.filter(id => id !== addOnId));
    } else {
      setAddOns([...addOns, addOnId]);
    }
  };

  const handleCreateSubscription = async () => {
    try {
      setProcessingPayment(true);
      setError(null);
      
      if (!selectedPlanId) {
        setError('Por favor selecciona un plan');
        return;
      }
      
      // Validate payment method
      if (
        !paymentMethod.cardNumber ||
        !paymentMethod.cardExpiry ||
        !paymentMethod.cardCvc ||
        !paymentMethod.cardName
      ) {
        setError('Por favor completa los datos de pago');
        return;
      }
      
      // Simulate payment method ID creation
      const paymentMethodId = `pm_${Date.now()}`;
      
      // Create subscription
      await SubscriptionService.createSubscription(
        doctorId,
        selectedPlanId,
        paymentMethodId,
        addOns
      );
      
      // Refresh subscription
      await fetchSubscription();
      
      // Reset form
      setSelectedPlanId(null);
      setChangingPlan(false);
      setPaymentMethod({
        cardNumber: '',
        cardExpiry: '',
        cardCvc: '',
        cardName: ''
      });
      setAddOns([]);
    } catch (err) {
      setError(err.message || 'Failed to create subscription. Please try again.');
      console.error(err);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleChangePlan = async () => {
    if (!selectedPlanId || !subscription) {
      return;
    }
    
    try {
      setProcessingPayment(true);
      setError(null);
      
      // Change plan
      await SubscriptionService.changePlan(doctorId, selectedPlanId, true);
      
      // Add any new add-ons
      for (const addOnId of addOns) {
        await SubscriptionService.addAddOn(doctorId, addOnId);
      }
      
      // Refresh subscription
      await fetchSubscription();
      
      // Reset form
      setSelectedPlanId(null);
      setChangingPlan(false);
      setAddOns([]);
    } catch (err) {
      setError(err.message || 'Failed to change subscription plan. Please try again.');
      console.error(err);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('¿Estás seguro que deseas cancelar tu suscripción? Perderás el acceso a las funciones premium.')) {
      return;
    }
    
    try {
      await SubscriptionService.cancelSubscription(doctorId);
      
      // Refresh subscription
      await fetchSubscription();
    } catch (err) {
      setError(err.message || 'Failed to cancel subscription. Please try again.');
      console.error(err);
    }
  };

  // Render current subscription
  const renderCurrentSubscription = () => {
    if (!subscription) {
      return null;
    }
    
    const nextBillingDate = new Date(subscription.current_period_end);
    
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Plan actual: {subscription.plan.name}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Activo desde {new Date(subscription.created_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
              {subscription.status === 'active' ? 'Activo' : subscription.status}
            </span>
          </div>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Precio mensual</dt>
              <dd className="mt-1 text-sm text-gray-900">${subscription.price} MXN</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Próximo pago</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {nextBillingDate.toLocaleDateString()}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Método de pago</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <div className="flex items-center">
                  <CreditCard size={16} className="text-gray-500 mr-2" />
                  <span>Tarjeta terminando en **** 1234</span>
                </div>
              </dd>
            </div>
            
            {subscription.subscription_items && subscription.subscription_items.length > 0 && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Complementos</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                    {subscription.subscription_items.map((item) => {
                      const addOn = SUBSCRIPTION_ADDONS.find(a => a.id === item.item_id);
                      
                      if (!addOn) return null;
                      
                      return (
                        <li key={item.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                          <div className="w-0 flex-1 flex items-center">
                            <Package size={16} className="flex-shrink-0 text-gray-500" />
                            <span className="ml-2 flex-1 w-0 truncate">{addOn.name}</span>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <span className="font-medium text-gray-900">${item.price} MXN/mes</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </dd>
              </div>
            )}
            
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Acciones</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setChangingPlan(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cambiar plan
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleCancelSubscription}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancelar suscripción
                  </button>
                </div>
              </dd>
            </div>
          </dl>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => {
              setShowHistory(!showHistory);
              if (!showHistory) {
                fetchSubscriptionHistory();
              }
            }}
            className="flex items-center text-sm text-blue-600 hover:text-blue-500"
          >
            {showHistory ? <ChevronDown size={16} className="mr-1" /> : <ChevronRight size={16} className="mr-1" />}
            {showHistory ? 'Ocultar historial de suscripciones' : 'Ver historial de suscripciones'}
          </button>
          
          {showHistory && subscriptionHistory.length > 0 && (
            <div className="mt-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Plan
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Precio
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Estado
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subscriptionHistory.map((sub) => (
                    <tr key={sub.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {sub.plan_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${sub.price} MXN
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          sub.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : sub.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render plans selection
  const renderPlanSelection = () => {
    // Get compatible add-ons for the selected plan
    const compatibleAddOns = selectedPlanId 
      ? SubscriptionService.getAddOnsForPlan(selectedPlanId)
      : [];
    
    return (
      <div className="space-y-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {subscription ? 'Cambiar plan' : 'Seleccionar plan'}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Elige el plan que mejor se adapte a tus necesidades
            </p>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            {/* Billing cycle toggle */}
            <div className="flex justify-center mb-8">
              <div className="relative flex items-center">
                <span className={`mr-3 text-sm ${!isYearly ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                  Mensual
                </span>
                <button
                  type="button"
                  onClick={() => setIsYearly(!isYearly)}
                  className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isYearly ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className="sr-only">Toggle billing cycle</span>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                      isYearly ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className={`ml-3 text-sm ${isYearly ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                  Anual (20% descuento)
                </span>
                
                {isYearly && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                    2 meses gratis
                  </span>
                )}
              </div>
            </div>
            
            {/* Plans display */}
            <SubscriptionPlans
              currentPlanId={subscription?.plan_id}
              onSelectPlan={handleSelectPlan}
              isYearly={isYearly}
            />
          </div>
        </div>
        
        {selectedPlanId && (
          <>
            {/* Add-ons selection */}
            {compatibleAddOns.length > 0 && (
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Complementos opcionales
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Personaliza tu plan con funciones adicionales
                  </p>
                </div>
                
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <ul className="divide-y divide-gray-200">
                    {compatibleAddOns.map((addOn) => (
                      <li key={addOn.id} className="py-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            id={`addon-${addOn.id}`}
                            name={`addon-${addOn.id}`}
                            type="checkbox"
                            checked={addOns.includes(addOn.id)}
                            onChange={() => handleToggleAddOn(addOn.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="ml-3">
                            <label htmlFor={`addon-${addOn.id}`} className="text-sm font-medium text-gray-700">
                              {addOn.name}
                            </label>
                            <p className="text-sm text-gray-500">{addOn.description}</p>
                          </div>
                        </div>
                        <div className="ml-4 text-sm font-medium text-gray-900">
                          ${isYearly ? Math.round(addOn.price * 10) : addOn.price} MXN/mes
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {/* Payment information (only for new subscriptions) */}
            {!subscription && (
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Información de pago
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Ingresa los datos de tu tarjeta para procesar el pago
                  </p>
                </div>
                
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6">
                      <label htmlFor="card-name" className="block text-sm font-medium text-gray-700">
                        Nombre en la tarjeta
                      </label>
                      <input
                        type="text"
                        name="card-name"
                        id="card-name"
                        value={paymentMethod.cardName}
                        onChange={(e) => setPaymentMethod({ ...paymentMethod, cardName: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div className="col-span-6">
                      <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">
                        Número de tarjeta
                      </label>
                      <input
                        type="text"
                        name="card-number"
                        id="card-number"
                        placeholder="1234 1234 1234 1234"
                        value={paymentMethod.cardNumber}
                        onChange={(e) => setPaymentMethod({ ...paymentMethod, cardNumber: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div className="col-span-3">
                      <label htmlFor="card-expiry" className="block text-sm font-medium text-gray-700">
                        Fecha de expiración
                      </label>
                      <input
                        type="text"
                        name="card-expiry"
                        id="card-expiry"
                        placeholder="MM/AA"
                        value={paymentMethod.cardExpiry}
                        onChange={(e) => setPaymentMethod({ ...paymentMethod, cardExpiry: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div className="col-span-3">
                      <label htmlFor="card-cvc" className="block text-sm font-medium text-gray-700">
                        CVC
                      </label>
                      <input
                        type="text"
                        name="card-cvc"
                        id="card-cvc"
                        placeholder="123"
                        value={paymentMethod.cardCvc}
                        onChange={(e) => setPaymentMethod({ ...paymentMethod, cardCvc: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Order summary */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Resumen de la orden
                </h3>
              </div>
              
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <dl className="space-y-4">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">
                      Plan seleccionado
                    </dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {SubscriptionService.getPlanById(selectedPlanId)?.name || selectedPlanId}
                    </dd>
                  </div>
                  
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">
                      Precio del plan
                    </dt>
                    <dd className="text-sm font-medium text-gray-900">
                      ${isYearly 
                        ? Math.round(SubscriptionService.getPlanById(selectedPlanId)?.price * 10) 
                        : SubscriptionService.getPlanById(selectedPlanId)?.price} MXN/mes
                    </dd>
                  </div>
                  
                  {addOns.length > 0 && (
                    <>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">
                          Complementos
                        </dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {addOns.length} seleccionados
                        </dd>
                      </div>
                      
                      {addOns.map((addOnId) => {
                        const addOn = SUBSCRIPTION_ADDONS.find(a => a.id === addOnId);
                        
                        if (!addOn) return null;
                        
                        return (
                          <div key={addOnId} className="flex justify-between pl-4">
                            <dt className="text-sm text-gray-500">
                              {addOn.name}
                            </dt>
                            <dd className="text-sm text-gray-900">
                              ${isYearly ? Math.round(addOn.price * 10) : addOn.price} MXN/mes
                            </dd>
                          </div>
                        );
                      })}
                    </>
                  )}
                  
                  <div className="pt-4 border-t border-gray-200 flex justify-between">
                    <dt className="text-base font-medium text-gray-900">
                      Total mensual
                    </dt>
                    <dd className="text-base font-medium text-gray-900">
                      ${isYearly 
                        ? Math.round(SubscriptionService.getPlanById(selectedPlanId)?.price * 10) + 
                          addOns.reduce((sum, addOnId) => {
                            const addOn = SUBSCRIPTION_ADDONS.find(a => a.id === addOnId);
                            return sum + (addOn ? Math.round(addOn.price * 10) : 0);
                          }, 0)
                        : SubscriptionService.getPlanById(selectedPlanId)?.price + 
                          addOns.reduce((sum, addOnId) => {
                            const addOn = SUBSCRIPTION_ADDONS.find(a => a.id === addOnId);
                            return sum + (addOn ? addOn.price : 0);
                          }, 0)} MXN/mes
                    </dd>
                  </div>
                  
                  {isYearly && (
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                      <dt>Ahorro anual</dt>
                      <dd>$
                        {Math.round(
                          (SubscriptionService.getPlanById(selectedPlanId)?.price * 2) + 
                          addOns.reduce((sum, addOnId) => {
                            const addOn = SUBSCRIPTION_ADDONS.find(a => a.id === addOnId);
                            return sum + (addOn ? addOn.price * 2 : 0);
                          }, 0)
                        )} MXN
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
              
              <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-between items-center">
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlanId(null);
                      setChangingPlan(false);
                      setAddOns([]);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancelar
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={subscription ? handleChangePlan : handleCreateSubscription}
                    disabled={processingPayment}
                    className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      processingPayment ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {processingPayment 
                      ? 'Procesando...' 
                      : subscription 
                        ? 'Confirmar cambio de plan' 
                        : 'Confirmar suscripción'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // Render no subscription state
  const renderNoSubscription = () => {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No tienes una suscripción activa</h3>
          <p className="mt-1 text-sm text-gray-500">
            Selecciona un plan para acceder a todas las funciones de Doctor.mx
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setChangingPlan(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Ver planes
              <ArrowRight size={16} className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Suscripción</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Gestiona tu plan de suscripción y facturación
          </p>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Error
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {changingPlan ? (
                renderPlanSelection()
              ) : subscription ? (
                renderCurrentSubscription()
              ) : (
                renderNoSubscription()
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManagement;