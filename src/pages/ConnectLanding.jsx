import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import Icon from '../components/ui/Icon';

function Logo() {
  return (
    <a href="/" className="flex items-center gap-3 group">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-teal-600 text-white shadow-lg transition-all duration-200 group-hover:shadow-blue-500/25 group-hover:scale-105">
        <Icon name="heart" size="lg" color="white" />
      </div>
      <span className="text-2xl font-bold tracking-tight text-gray-900 transition-colors duration-200 group-hover:text-blue-600">doctor.mx</span>
    </a>
  )
}

export default function ConnectLanding() {
  return (
    <Layout variant="marketing">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-teal-600">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Verificado NOM-004 • SSL Seguro
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Recibe pacientes referidos por IA
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Nuestro doctor IA tria pacientes y los refiere a médicos locales para consultas presenciales y telemedicina.
              Flexible, bien pagado, sin burocracia.
            </p>
            
            {/* Dr. Simeon - AI Doctor Example */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20 max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <img 
                    src="/images/simeontest.webp" 
                    alt="Dr. Simeon - AI Doctor" 
                    className="w-16 h-16 rounded-full object-cover border-4 border-white/30 shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">Dr. Simeon</h3>
                  <p className="text-white/80 text-sm">Nuestro Doctor IA • Médico General</p>
                  <div className="flex items-center gap-2 text-xs text-white/70 mt-1">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      4.9/5
                    </span>
                    <span>•</span>
                    <span>Disponible 24/7</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Así funciona nuestro sistema de referencias
                </h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm text-white/90">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Dr. Simeon analiza síntomas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Identifica especialidad necesaria</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Te refiere pacientes calificados</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 mb-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-white">$499</div>
                <div className="text-white/80 text-sm">MXN/mes</div>
              </div>
              <div className="w-px h-12 bg-white/30"></div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white">$200+</div>
                <div className="text-white/80 text-sm">por consulta</div>
              </div>
              <div className="w-px h-12 bg-white/30"></div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white">24/7</div>
                <div className="text-white/80 text-sm">tu horario</div>
              </div>
            </div>
            <Link
              to="/connect/signup"
              className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all hover:scale-105 shadow-xl"
            >
              Comenzar ahora
            </Link>
          </motion.div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Cómo funciona</h2>

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Regístrate y verifica</h3>
            <p className="text-gray-600">
              Sube tu cédula profesional. Verificamos en 24 horas con la SEP.
              Listo para empezar.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-blue-600">2</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Recibe referencias de IA</h3>
            <p className="text-gray-600">
              Nuestro doctor IA analiza síntomas y te refiere pacientes calificados.
              Consultas presenciales o por videollamada, tú decides.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-blue-600">3</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Cobra al instante</h3>
            <p className="text-gray-600">
              Pagos semanales a tu cuenta. Sin papeleo, sin esperas.
              Incluye recetas digitales válidas.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Earnings Calculator */}
      <div className="bg-gradient-to-br from-blue-600 to-teal-600 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">¿Cuánto puedes ganar?</h2>
          <p className="text-white/90 mb-8">Calcula tu ingreso potencial con pacientes referidos por IA</p>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-white/80 text-sm mb-2">Suscripción mensual</div>
                <div className="text-4xl font-bold text-white">$499</div>
                <div className="text-white/60 text-xs">MXN</div>
              </div>
              <div className="text-center">
                <div className="text-white/80 text-sm mb-2">Pago por consulta</div>
                <div className="text-4xl font-bold text-white">$200+</div>
                <div className="text-white/60 text-xs">70% para ti</div>
              </div>
              <div className="text-center">
                <div className="text-white/80 text-sm mb-2">Ingreso potencial</div>
                <div className="text-4xl font-bold text-white">$24k+</div>
                <div className="text-white/60 text-xs">MXN/mes</div>
              </div>
            </div>
            <p className="text-white/80 text-sm">
              Pacientes pre-cualificados por IA • Consultas presenciales y telemedicina • Sin intermediarios
            </p>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Beneficios para ti</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Herramientas diseñadas específicamente para médicos que buscan crecer con tecnología inteligente
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
              title: 'Referencias Inteligentes',
              desc: 'Nuestro doctor IA analiza síntomas y te refiere pacientes calificados para tu especialidad.'
            },
            {
              icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
              title: 'Pagos transparentes',
              desc: '70% del precio de consulta va directo a ti. Sin sorpresas.'
            },
            {
              icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
              title: 'Recetas válidas',
              desc: 'Sistema integrado de e-Rx con QR. Cumple con NOM-004.'
            },
            {
              icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
              title: 'Dashboard completo',
              desc: 'Seguimiento de pacientes referidos, métricas, ingresos y calidad de atención.'
            },
            {
              icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
              title: 'Sin burocracia',
              desc: 'Registro simple. Verificación rápida. Empiezas de inmediato.'
            },
            {
              icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
              title: 'Respaldo legal',
              desc: 'Consentimientos automatizados, auditoría y cumplimiento NOM-024.'
            },
          ].map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4">{benefit.icon}</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">{benefit.title}</h3>
              <p className="text-gray-600 text-sm">{benefit.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Consultation Types */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Tipos de consulta disponibles</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Consultas Presenciales</h3>
              <p className="text-gray-600 mb-4">
                Atiende pacientes en tu consultorio. El doctor IA los refiere con historia clínica completa y síntomas analizados.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Pacientes pre-cualificados por IA
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Historia clínica inicial completa
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Referencia específica a tu especialidad
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Telemedicina</h3>
              <p className="text-gray-600 mb-4">
                Consultas por videollamada desde cualquier lugar. Ideal para seguimientos, segundas opiniones y consultas de rutina.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Videollamadas HD integradas
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Recetas digitales con QR
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Expediente digital completo
                </li>
              </ul>
            </motion.div>
          </div>

          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">Especialidades más buscadas</h3>
          
          {/* Specialty Search Volume Chart */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-8">
            <div className="text-center mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Volumen de búsquedas por especialidad</h4>
              <p className="text-sm text-gray-600">Basado en consultas de pacientes en los últimos 3 meses</p>
            </div>
            
            <div className="space-y-4">
              {[
                { name: 'Medicina General', percentage: 28, searches: 1247, color: 'bg-blue-500' },
                { name: 'Dermatología', percentage: 18, searches: 801, color: 'bg-green-500' },
                { name: 'Psicología', percentage: 15, searches: 667, color: 'bg-purple-500' },
                { name: 'Nutrición', percentage: 12, searches: 534, color: 'bg-orange-500' },
                { name: 'Pediatría', percentage: 10, searches: 445, color: 'bg-pink-500' },
                { name: 'Ginecología', percentage: 8, searches: 356, color: 'bg-indigo-500' },
                { name: 'Medicina Interna', percentage: 6, searches: 267, color: 'bg-teal-500' },
                { name: 'Psiquiatría', percentage: 3, searches: 134, color: 'bg-gray-500' }
              ].map((specialty, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-gray-700 text-right flex-shrink-0">
                    {specialty.name}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div 
                          className={`${specialty.color} h-3 rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${specialty.percentage}%` }}
                        ></div>
                      </div>
                      <div className="w-16 text-sm font-semibold text-gray-900 text-right">
                        {specialty.percentage}%
                      </div>
                      <div className="w-20 text-xs text-gray-500 text-right">
                        {specialty.searches.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Total de consultas analizadas</span>
                <span className="font-semibold">4,451 consultas</span>
              </div>
            </div>
          </div>

          {/* Specialty Tags */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              'Medicina General',
              'Dermatología',
              'Nutrición',
              'Psicología',
              'Pediatría',
              'Ginecología',
              'Medicina Interna',
              'Psiquiatría'
            ].map((specialty, i) => (
              <span
                key={i}
                className="px-4 py-2 bg-white text-blue-700 font-medium rounded-full shadow-sm hover:shadow-md transition-shadow border border-gray-200 text-sm"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-blue-600 to-teal-600 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Únete a los médicos que ya están ganando más con horarios flexibles
          </p>
          <Link
            to="/connect/signup"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all hover:scale-105 shadow-xl"
          >
            Crear cuenta gratis
          </Link>
          <p className="text-white/70 text-sm mt-4">
            Verificación en 24 horas • Sin costo de registro • Empieza cuando quieras
          </p>
        </div>
      </div>

      {/* Trust Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Confianza y Seguridad Garantizada
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Nuestra plataforma cumple con los más altos estándares de seguridad y regulaciones médicas mexicanas
            </p>
          </div>
          
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Doctor.mx</h3>
              <p className="text-gray-400 text-sm">
                Referencias médicas inteligentes por IA para México
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Para Médicos</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/connect" className="hover:text-white">Cómo funciona</Link></li>
                <li><Link to="/connect/signup" className="hover:text-white">Registrarse</Link></li>
                <li><Link to="/connect/login" className="hover:text-white">Iniciar sesión</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/legal/terms" className="hover:text-white">Términos</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Privacidad</Link></li>
                <li><a href="mailto:doctors@doctor.mx" className="hover:text-white">Contacto</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2025 Doctor.mx • Todos los derechos reservados
          </div>
        </div>
      </footer>
      </div>
    </Layout>
  );
}