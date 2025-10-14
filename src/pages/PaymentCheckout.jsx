import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { toast } from '../lib/toast';

export default function PaymentCheckout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const consultId = searchParams.get('consult_id');

  const [loading, setLoading] = useState(false);
  const [consult, setConsult] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState('stripe');
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [applyCredits, setApplyCredits] = useState(true);
  const [userCredits, setUserCredits] = useState(0);
  const [paymentForm, setPaymentForm] = useState({
    email: '',
    name: '',
    phone: ''
  });

  const providers = [
    { id: 'stripe', name: 'Stripe', methods: ['card'] },
    { id: 'conekta', name: 'Conekta', methods: ['card', 'oxxo', 'spei'] },
    { id: 'openpay', name: 'OpenPay', methods: ['card', 'spei'] }
  ];

  const methods = {
    card: { name: 'Tarjeta de crédito/débito' },
    oxxo: { name: 'OXXO Pay' },
    spei: { name: 'SPEI (transferencia)' },
    codi: { name: 'CoDi' }
  };

  useEffect(() => {
    loadConsultData();
  }, [consultId]);

  const loadConsultData = async () => {
    if (!consultId) {
      toast.error('ID de consulta no válido');
      navigate('/');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Load consult
      const { data: consultData, error: consultError } = await supabase
        .from('consults')
        .select('*')
        .eq('id', consultId)
        .single();

      if (consultError) throw consultError;
      setConsult(consultData);

      // Load user credits
      const { data: creditsData } = await supabase
        .from('credits_ledger')
        .select('delta_mxn')
        .eq('user_id', user.id);

      const totalCredits = creditsData?.reduce((sum, c) => sum + c.delta_mxn, 0) || 0;
      setUserCredits(totalCredits);

      // Pre-fill form
      const { data: userData } = await supabase
        .from('users')
        .select('name, email, phone')
        .eq('id', user.id)
        .single();

      if (userData) {
        setPaymentForm({
          email: userData.email || '',
          name: userData.name || '',
          phone: userData.phone || ''
        });
      }

    } catch (error) {
      console.error('Error loading consult:', error);
      toast.error('Error al cargar consulta');
      navigate('/');
    }
  };

  const calculateFinalPrice = () => {
    if (!consult) return 0;
    const basePrice = consult.price_mxn;
    const creditsToUse = applyCredits ? Math.min(userCredits, basePrice) : 0;
    return Math.max(0, basePrice - creditsToUse);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!paymentForm.email || !paymentForm.name) {
        toast.error('Completa todos los campos requeridos');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const finalPrice = calculateFinalPrice();
      const creditsUsed = applyCredits ? Math.min(userCredits, consult.price_mxn) : 0;

      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          consult_id: consultId,
          provider: selectedProvider,
          method: selectedMethod,
          amount_mxn: finalPrice,
          fee_split: {
            patient_paid: finalPrice,
            credits_used: creditsUsed,
            platform_fee: Math.round(finalPrice * 0.15),
            doctor_payout: Math.round(finalPrice * 0.70)
          },
          status: 'requires_action'
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Apply credits if used
      if (creditsUsed > 0) {
        await supabase.from('credits_ledger').insert({
          user_id: user.id,
          delta_mxn: -creditsUsed,
          reason: 'referral_spent',
          metadata: { consult_id: consultId, payment_id: payment.id }
        });
      }

      // Log audit
      await supabase.from('audit_trail').insert({
        actor_user_id: user.id,
        entity: 'payments',
        entity_id: payment.id,
        action: 'payment_initiated',
        diff: { provider: selectedProvider, method: selectedMethod, amount: finalPrice }
      });

      // Simulate payment processing
      // In production, this would integrate with actual payment providers
      if (selectedMethod === 'card') {
        // Stripe/Conekta card payment
        await simulateCardPayment(payment.id);
      } else if (selectedMethod === 'oxxo') {
        // Generate OXXO reference
        await generateOXXOReference(payment.id);
      } else if (selectedMethod === 'spei') {
        // Generate SPEI reference
        await generateSPEIReference(payment.id);
      }

      toast.success('Pago procesado exitosamente');

      // Update consult as paid
      await supabase
        .from('consults')
        .update({ paid: true, status: 'assigned' })
        .eq('id', consultId);

      // Navigate to receipt
      navigate(`/receipt/${consultId}`);

    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Error al procesar pago');
    } finally {
      setLoading(false);
    }
  };

  const simulateCardPayment = async (paymentId) => {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    await supabase
      .from('payments')
      .update({
        status: 'succeeded',
        provider_payment_id: 'sim_' + Math.random().toString(36).substring(7)
      })
      .eq('id', paymentId);
  };

  const generateOXXOReference = async (paymentId) => {
    const reference = 'OXXO-' + Math.random().toString(36).substring(2, 15).toUpperCase();

    await supabase
      .from('payments')
      .update({
        provider_payment_id: reference,
        status: 'requires_action'
      })
      .eq('id', paymentId);

    toast.info(`Referencia OXXO: ${reference}`, { autoClose: 10000 });
  };

  const generateSPEIReference = async (paymentId) => {
    const reference = Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();

    await supabase
      .from('payments')
      .update({
        provider_payment_id: reference,
        status: 'requires_action'
      })
      .eq('id', paymentId);

    toast.info(`CLABE: 012180001234567890\nReferencia: ${reference}`, { autoClose: 15000 });
  };

  if (!consult) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const finalPrice = calculateFinalPrice();
  const creditsApplied = applyCredits ? Math.min(userCredits, consult.price_mxn) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-medical-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-medical-500 to-medical-600 text-white p-6">
            <h1 className="text-3xl font-bold mb-2">Checkout</h1>
            <p className="text-white/90">Completa tu pago para iniciar la consulta</p>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {/* Order Summary */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen de orden</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">Consulta médica ({consult.specialty || 'General'})</span>
                  <span className="font-semibold text-gray-900">${consult.price_mxn} MXN</span>
                </div>
                {creditsApplied > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Créditos aplicados</span>
                    <span className="font-semibold">-${creditsApplied} MXN</span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-300 flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total a pagar</span>
                  <span className="text-2xl font-bold text-medical-600">${finalPrice} MXN</span>
                </div>
              </div>

              {/* Credits Toggle */}
              {userCredits > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyCredits}
                      onChange={(e) => setApplyCredits(e.target.checked)}
                      className="w-4 h-4 text-medical-600 rounded focus:ring-2 focus:ring-medical-500"
                    />
                    <span className="text-sm text-gray-700">
                      Usar ${userCredits} MXN de créditos disponibles
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Payment Provider Selection */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Método de pago</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {providers.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => {
                      setSelectedProvider(provider.id);
                      setSelectedMethod(provider.methods[0]);
                    }}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      selectedProvider === provider.id
                        ? 'border-medical-500 bg-medical-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{provider.logo}</div>
                    <div className="font-semibold text-gray-900">{provider.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tipo de pago</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {providers
                  .find(p => p.id === selectedProvider)
                  ?.methods.map((method) => (
                    <button
                      key={method}
                      onClick={() => setSelectedMethod(method)}
                      className={`p-4 border-2 rounded-lg transition-all text-left ${
                        selectedMethod === method
                          ? 'border-medical-500 bg-medical-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{methods[method].icon}</span>
                        <span className="font-semibold text-gray-900">{methods[method].name}</span>
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            {/* Payment Form */}
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={paymentForm.email}
                  onChange={(e) => setPaymentForm({ ...paymentForm, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  required
                  value={paymentForm.name}
                  onChange={(e) => setPaymentForm({ ...paymentForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                  placeholder="Nombre Apellido"
                />
              </div>

              {selectedMethod === 'card' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Demo:</strong> En producción, aquí aparecerá el formulario seguro de{' '}
                    {selectedProvider === 'stripe' ? 'Stripe' : 'Conekta'} para capturar tu tarjeta.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || finalPrice === 0}
                className="w-full py-4 bg-gradient-to-r from-medical-500 to-medical-600 text-white font-bold rounded-lg hover:from-medical-600 hover:to-medical-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-lg"
              >
                {loading ? 'Procesando...' : finalPrice === 0 ? 'Aplicar créditos' : `Pagar $${finalPrice} MXN`}
              </button>

              <p className="flex items-center justify-center gap-2 text-center text-xs text-gray-500">
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                </svg>
                Pago seguro - Tus datos están protegidos con encriptación SSL
              </p>
            </form>

            {/* Info */}
            <div className="bg-gray-100 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">ℹ️ ¿Qué incluye tu consulta?</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Atención médica profesional por WhatsApp</li>
                <li>• Diagnóstico y tratamiento personalizado</li>
                <li>• Receta electrónica válida (si aplica)</li>
                <li>• Seguimiento post-consulta</li>
                <li>• Comprobante fiscal (CFDI) automático</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
            </svg>
            <span>SSL Seguro</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>NOM-004</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span>Pagos MX</span>
          </div>
        </div>
      </div>
    </div>
  );
}
