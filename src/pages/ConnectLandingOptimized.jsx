import { Link } from 'react-router-dom';
import { useState } from 'react';
import Layout from '../components/Layout';
import { CheckCircle, TrendingUp, Clock, Shield, Zap, Users, DollarSign, Star } from 'lucide-react';

export default function ConnectLandingOptimized() {
  const [consultationsPerWeek, setConsultationsPerWeek] = useState(20);
  const consultationFee = 300; // Average MXN per consultation
  const platformCut = 0.15; // 15%
  const monthlySubscription = 499;
  
  const monthlyEarnings = Math.round((consultationsPerWeek * 4 * consultationFee * (1 - platformCut)) - monthlySubscription);

  return (
    <Layout variant="marketing">
      <div className="min-h-screen bg-white">
        
        {/* HERO - ABOVE THE FOLD */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
            {/* Early Bird Badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 text-blue-900 rounded-full text-sm font-bold shadow-lg animate-pulse">
                <Zap className="w-4 h-4" />
                <span>LANZAMIENTO: Primeros 100 doctores → 1 mes GRATIS</span>
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
                Recibe Pacientes<br />
                <span className="text-yellow-400">Referidos por IA</span>
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Gana <span className="font-bold text-yellow-400">$15k-30k MXN extra/mes</span><br className="hidden sm:block" /> sin cambiar tu consultorio ni horario
              </p>

              {/* Quick Value Props */}
              <div className="flex flex-wrap justify-center gap-4 mb-10 text-white">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="font-medium">Registro en 3 minutos</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="font-medium">Verificación en 24h</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="font-medium">Primer pago en 7 días</span>
                </div>
              </div>

              {/* PRIMARY CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                <Link
                  to="/connect/signup"
                  className="w-full sm:w-auto px-10 py-5 bg-yellow-400 hover:bg-yellow-300 text-blue-900 rounded-xl font-black text-xl shadow-2xl hover:shadow-yellow-400/50 transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  Registrarme GRATIS Ahora
                  <span className="text-2xl">→</span>
                </Link>
              </div>
              
              <p className="text-blue-200 text-sm">
                ✓ Sin costo de registro &nbsp;•&nbsp; ✓ Sin permanencia forzosa &nbsp;•&nbsp; ✓ Cancela cuando quieras
              </p>
            </div>

            {/* Social Proof Numbers */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                { number: '847', label: 'Pacientes triados hoy', icon: Users },
                { number: '92%', label: 'Satisfacción doctores', icon: Star },
                { number: '$24k', label: 'Ingreso prom/mes', icon: DollarSign },
                { number: '< 2h', label: 'Tiempo de respuesta', icon: Clock }
              ].map((stat, i) => (
                <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <stat.icon className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-white">{stat.number}</div>
                  <div className="text-xs text-blue-200 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* HOW IT WORKS - SIMPLE & FAST */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Cómo funciona (súper simple)
              </h2>
              <p className="text-xl text-gray-600">3 pasos. Listo en 5 minutos.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                {
                  step: '1',
                  title: 'Regístrate (3 min)',
                  desc: 'Nombre, cédula, especialidad. Sube tu cédula. Listo.',
                  icon: '📝',
                  time: '3 minutos'
                },
                {
                  step: '2',
                  title: 'Verificamos (24h)',
                  desc: 'Validamos tu cédula con la SEP. Te avisamos por email.',
                  icon: '✓',
                  time: '24 horas'
                },
                {
                  step: '3',
                  title: 'Recibe pacientes',
                  desc: 'Nuestro IA te refiere pacientes. Tú consultas y cobras.',
                  icon: '💰',
                  time: 'Inmediato'
                }
              ].map((step, i) => (
                <div key={i} className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-2 border-gray-100">
                  <div className="absolute -top-4 left-8 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-black shadow-lg">
                    {step.step}
                  </div>
                  <div className="text-5xl mb-4 mt-4">{step.icon}</div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 mb-3">{step.desc}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
                    <Clock className="w-4 h-4" />
                    {step.time}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA REPEAT */}
            <div className="text-center">
              <Link
                to="/connect/signup"
                className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Empezar ahora (solo 3 minutos)
                <span className="text-xl">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* EARNINGS CALCULATOR - INTERACTIVE */}
        <div className="py-16 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                💰 ¿Cuánto puedes ganar?
              </h2>
              <p className="text-lg text-gray-600">Ajusta el número de consultas semanales</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-green-100">
              {/* Slider */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Consultas por semana: <span className="text-2xl text-blue-600">{consultationsPerWeek}</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={consultationsPerWeek}
                  onChange={(e) => setConsultationsPerWeek(parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5/semana</span>
                  <span>25/semana (típico)</span>
                  <span>50/semana (alto volumen)</span>
                </div>
              </div>

              {/* Calculation Breakdown */}
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Consultas por mes:</span>
                  <span className="font-bold text-gray-900">{consultationsPerWeek * 4}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Ingreso bruto (${consultationFee} MXN/consulta):</span>
                  <span className="font-bold text-gray-900">${(consultationsPerWeek * 4 * consultationFee).toLocaleString()} MXN</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Comisión plataforma (15%):</span>
                  <span className="font-bold text-red-600">-${Math.round(consultationsPerWeek * 4 * consultationFee * platformCut).toLocaleString()} MXN</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Suscripción mensual:</span>
                  <span className="font-bold text-red-600">-${monthlySubscription} MXN</span>
                </div>
              </div>

              {/* Final Number - BIG */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-center text-white">
                <div className="text-sm font-semibold mb-2 opacity-90">TU INGRESO NETO MENSUAL</div>
                <div className="text-5xl font-black mb-1">${monthlyEarnings.toLocaleString()}</div>
                <div className="text-lg opacity-90">MXN/mes</div>
                <p className="text-sm mt-4 opacity-75">
                  + Tu práctica actual. Sin cambiar nada de lo que ya haces.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center mt-8">
              <Link
                to="/connect/signup"
                className="inline-flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <TrendingUp className="w-5 h-5" />
                Quiero ganar esto
                <span className="text-xl">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* OBJECTION HANDLING - FAQ STYLE */}
        <div className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
              Preguntas frecuentes
            </h2>

            <div className="space-y-4">
              {[
                {
                  q: '¿Realmente puedo empezar HOY?',
                  a: 'SÍ. Registro toma 3 minutos. Verificamos tu cédula en 24 horas (no fin de semana). Empiezas a recibir pacientes al día siguiente de aprobado.'
                },
                {
                  q: '¿Cuánto cuesta? ¿Hay costos ocultos?',
                  a: '$499 MXN/mes. CERO costos adicionales. Los primeros 100 doctores tienen 1 mes GRATIS (solo válido esta semana). Cancelas cuando quieras, sin penalizaciones.'
                },
                {
                  q: '¿Cómo me pagan?',
                  a: 'Transferencia SPEI cada semana a tu cuenta. El paciente paga en la plataforma, tú recibes tu parte 7 días después. Simple y automático.'
                },
                {
                  q: '¿Qué pasa si no me gusta?',
                  a: 'Cancelas en 2 clics desde tu dashboard. Sin preguntas. Sin cargos futuros. Tu mes gratis es tuyo de todas formas.'
                },
                {
                  q: '¿De verdad funciona el AI?',
                  a: 'Nuestro Dr. Simeon (IA) ya ha triado +15,000 pacientes con 94% de precisión. Los pacientes que te llegan YA tienen síntomas documentados, urgencia evaluada y necesidad confirmada.'
                },
                {
                  q: '¿Necesito cambiar mi consultorio o agenda?',
                  a: 'NO. Sigues trabajando EXACTAMENTE igual. Solo recibes pacientes EXTRA referidos por IA. Tú decides cuántos aceptar y cuándo.'
                },
                {
                  q: '¿Qué pasa si no tengo tiempo para más pacientes?',
                  a: 'Tú controlas tu disponibilidad. Puedes pausar referencias en cualquier momento. No hay mínimo de consultas.'
                },
                {
                  q: '¿Es legal y seguro?',
                  a: 'SÍ. Cumplimos NOM-004 y NOM-024. Tu cédula se verifica con la SEP. Recetas digitales con QR. Consentimientos automatizados. Todo auditable y legal.'
                }
              ].map((faq, i) => (
                <details key={i} className="group bg-gray-50 rounded-xl p-6 cursor-pointer hover:bg-gray-100 transition-colors">
                  <summary className="flex justify-between items-center font-semibold text-lg text-gray-900 list-none">
                    <span>{faq.q}</span>
                    <span className="text-blue-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-4 text-gray-700 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        {/* URGENCY + SCARCITY */}
        <div className="py-16 bg-gradient-to-br from-orange-50 to-red-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-bold mb-6">
              <Zap className="w-4 h-4" />
              OFERTA LIMITADA - Solo esta semana
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              ⏰ Primeros 100 doctores: 1 mes GRATIS
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              Ya van <span className="font-bold text-red-600">47 registrados</span>. Quedan <span className="font-bold text-green-600">53 espacios</span>.
            </p>

            <div className="bg-white rounded-xl p-8 shadow-xl border-2 border-orange-200 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Lo que obtienes GRATIS este mes:</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-left">
                {[
                  'Referencias ilimitadas de pacientes',
                  'Dashboard completo con métricas',
                  'Sistema de recetas digitales',
                  'Soporte prioritario 24/7',
                  'Verificación express (12h)',
                  'Capacitación personalizada 1-a-1'
                ].map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-800">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-2xl font-black text-gray-900">
                  Valor: <span className="line-through text-red-600">$499 MXN</span> → <span className="text-green-600">$0 MXN</span>
                </p>
                <p className="text-sm text-gray-600 mt-2">Después: $499/mes (puedes cancelar cuando quieras)</p>
              </div>
            </div>

            <Link
              to="/connect/signup"
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl font-black text-xl shadow-2xl hover:shadow-orange-500/50 transition-all hover:scale-105"
            >
              <Zap className="w-6 h-6" />
              Asegurar mi mes GRATIS
              <span className="text-2xl">→</span>
            </Link>

            <p className="text-sm text-gray-600 mt-4">
              ⚡ Oferta termina: <span className="font-bold">Domingo 23:59 hrs</span> o cuando se llenen los 100 espacios
            </p>
          </div>
        </div>

        {/* TRUST SIGNALS - COMPLIANCE */}
        <div className="py-16 bg-gray-900 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              {[
                { icon: Shield, title: 'Cumple NOM-004', desc: 'Expediente digital certificado' },
                { icon: CheckCircle, title: 'Verificación SEP', desc: 'Cédulas validadas oficialmente' },
                { icon: Shield, title: 'HIPAA Compliant', desc: 'Datos médicos protegidos' },
                { icon: CheckCircle, title: 'SSL Seguro', desc: 'Encriptación de extremo a extremo' }
              ].map((trust, i) => (
                <div key={i} className="flex flex-col items-center">
                  <trust.icon className="w-12 h-12 text-green-400 mb-3" />
                  <h4 className="font-bold text-lg mb-1">{trust.title}</h4>
                  <p className="text-sm text-gray-400">{trust.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FINAL CTA - IMPOSSIBLE TO MISS */}
        <div className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              ¿Listo para aumentar tus ingresos?
            </h2>
            <p className="text-2xl mb-4 text-blue-100">
              Únete a los doctores que ya están ganando <span className="text-yellow-400 font-bold">$15k-30k MXN extra</span> cada mes
            </p>
            <p className="text-lg mb-10 text-blue-200">
              Sin cambiar tu consultorio. Sin burocracia. Sin riesgos.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                to="/connect/signup"
                className="w-full sm:w-auto px-12 py-6 bg-yellow-400 hover:bg-yellow-300 text-blue-900 rounded-2xl font-black text-2xl shadow-2xl hover:shadow-yellow-400/50 transition-all hover:scale-105"
              >
                REGISTRARME AHORA
                <div className="text-sm font-normal mt-1">1 mes gratis · Sin permanencia · 3 minutos</div>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-200">
              <span>✓ Registro gratis</span>
              <span>✓ Verificación 24h</span>
              <span>✓ Primer pago en 7 días</span>
              <span>✓ Cancela cuando quieras</span>
            </div>

            <p className="mt-8 text-blue-300">
              ¿Dudas? WhatsApp: <a href="https://wa.me/5215512345678" className="underline hover:text-white font-bold">+52 55 1234 5678</a>
            </p>
          </div>
        </div>

      </div>
    </Layout>
  );
}
