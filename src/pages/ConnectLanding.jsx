import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function Logo() {
  return (
    <a href="/" className="flex items-center gap-3 group">
      <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-slate-500/25 transition-all duration-300">
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 4h4a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2H6a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2V6a2 2 0 0 1 2-2z"/>
        </svg>
      </div>
      <span className="text-2xl font-bold tracking-tight text-slate-900 transition-colors duration-200 group-hover:text-slate-700">doctor.mx</span>
    </a>
  )
}

export default function ConnectLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8">
          <Logo />
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Volver al inicio
            </Link>
            <Link
              to="/connect/signup"
              className="px-6 py-2.5 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl font-semibold hover:from-slate-800 hover:to-slate-900 transition-all duration-300 shadow-lg hover:shadow-slate-500/25"
            >
              Únete Ahora
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
        {/* Sophisticated background patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:60px_60px]"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Premium badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-sm border border-white/20 rounded-full mb-8">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white/90 text-sm font-medium">Plataforma Premium para Médicos</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
              Sé encontrado por
              <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                IA Médica
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed">
              Únete a la red más exclusiva de México. Recibe pacientes pre-cualificados 
              por inteligencia artificial. Sin intermediarios, sin comisiones ocultas.
            </p>

            {/* Premium pricing highlight */}
            <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8 mb-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-sm text-white/70 mb-2">MEMBRESÍA PREMIUM</div>
                <div className="text-5xl font-bold text-white mb-2">$499</div>
                <div className="text-white/80 mb-4">MXN / mes</div>
                <div className="text-sm text-white/70">
                  • Pacientes pre-cualificados por IA<br/>
                  • Sin comisiones por consulta<br/>
                  • Dashboard premium incluido
                </div>
              </div>
            </div>

            {/* Key metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">$499</div>
                <div className="text-white/70 text-sm">mensualidad fija</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">100%</div>
                <div className="text-white/70 text-sm">de tus ingresos</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">24/7</div>
                <div className="text-white/70 text-sm">referencias IA</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/connect/signup"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 shadow-2xl shadow-blue-500/25"
              >
                Únete a la Red Premium
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <button className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300">
                Ver Demo
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-5-9v.01M12 3v.01" />
                </svg>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Cómo funciona</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Proceso simple y transparente para unirte a la red más exclusiva de médicos en México
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <span className="text-2xl font-bold text-white">1</span>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-slate-900">Regístrate Premium</h3>
            <p className="text-slate-600 leading-relaxed">
              Sube tu cédula profesional y paga la membresía de $499 MXN/mes. 
              Verificación en 24 horas. Acceso inmediato al dashboard premium.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <span className="text-2xl font-bold text-white">2</span>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-slate-900">Recibe Pacientes IA</h3>
            <p className="text-slate-600 leading-relaxed">
              Nuestra IA médica te envía pacientes pre-cualificados con historial completo. 
              Sin intermediarios, sin comisiones. Tú decides cuándo atender.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <span className="text-2xl font-bold text-white">3</span>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-slate-900">Cobra Directo</h3>
            <p className="text-slate-600 leading-relaxed">
              Recibe el 100% de tus ingresos. Pagos directos a tu cuenta. 
              Dashboard premium con métricas avanzadas y seguimiento de pacientes.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Earnings Calculator */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Calculadora de Ingresos</h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Descubre tu potencial de ingresos con pacientes pre-cualificados por IA
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="text-center">
                <div className="text-white/80 text-sm mb-2">Consultas por día</div>
                <div className="text-4xl font-bold text-white">3-6</div>
                <div className="text-white/60 text-xs">promedio</div>
              </div>
              <div className="text-center">
                <div className="text-white/80 text-sm mb-2">Pago por consulta</div>
                <div className="text-4xl font-bold text-white">$300</div>
                <div className="text-white/60 text-xs">promedio</div>
              </div>
              <div className="text-center">
                <div className="text-white/80 text-sm mb-2">Ingreso mensual</div>
                <div className="text-4xl font-bold text-white">$27k-54k</div>
                <div className="text-white/60 text-xs">antes de membresía</div>
              </div>
              <div className="text-center">
                <div className="text-white/80 text-sm mb-2">Neto mensual</div>
                <div className="text-4xl font-bold text-green-400">$26.5k-53.5k</div>
                <div className="text-white/60 text-xs">después de $499</div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-white/80 text-sm mb-4">
                Membresía fija de $499 MXN/mes • Sin comisiones • Sin intermediarios
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-400 text-sm font-medium">ROI promedio: 5,300%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Benefits */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Beneficios Premium</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Todo lo que necesitas para crecer tu práctica médica digital
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
              title: 'IA Médica Avanzada',
              desc: 'Pacientes pre-cualificados con historial completo y triage inteligente'
            },
            {
              icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
              title: 'Sin Comisiones',
              desc: 'Recibe el 100% de tus ingresos. Solo la membresía fija de $499 MXN/mes'
            },
            {
              icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
              title: 'Dashboard Premium',
              desc: 'Métricas avanzadas, seguimiento de pacientes y análisis de rendimiento'
            },
            {
              icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
              title: 'WhatsApp Native',
              desc: 'Atiende desde tu teléfono. Sin apps complicadas ni plataformas lentas'
            },
            {
              icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
              title: 'Recetas Digitales',
              desc: 'Sistema integrado de e-Rx con QR. Cumple con NOM-004 y NOM-024'
            },
            {
              icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
              title: 'Respaldo Legal',
              desc: 'Consentimientos automatizados, auditoría completa y cumplimiento normativo'
            },
          ].map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg">
                {benefit.icon}
              </div>
              <h3 className="font-bold text-lg mb-3 text-slate-900">{benefit.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{benefit.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Specialties */}
      <div className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Especialidades Premium</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Médicos especialistas más buscados por nuestra IA médica
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              'Medicina General',
              'Dermatología',
              'Nutrición Clínica',
              'Psicología',
              'Pediatría',
              'Ginecología',
              'Medicina Interna',
              'Psiquiatría',
              'Cardiología',
              'Endocrinología',
              'Gastroenterología',
              'Neurología'
            ].map((specialty, i) => (
              <span
                key={i}
                className="px-6 py-3 bg-white text-slate-700 font-semibold rounded-full shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 hover:border-blue-300"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl font-bold mb-6 text-white">
              Únete a la Red Premium
            </h2>
            <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto">
              Sé parte de la red más exclusiva de médicos en México. 
              Pacientes pre-cualificados por IA, sin comisiones, dashboard premium.
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-12 max-w-2xl mx-auto border border-white/20">
              <div className="text-center">
                <div className="text-sm text-white/70 mb-2">MEMBRESÍA PREMIUM</div>
                <div className="text-6xl font-bold text-white mb-2">$499</div>
                <div className="text-white/80 mb-4">MXN / mes</div>
                <div className="text-sm text-white/70">
                  • Pacientes pre-cualificados por IA<br/>
                  • Sin comisiones por consulta<br/>
                  • Dashboard premium incluido<br/>
                  • Respaldo legal completo
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/connect/signup"
                className="group inline-flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 shadow-2xl shadow-blue-500/25"
              >
                Comenzar Ahora
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <button className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300">
                Agendar Demo
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            
            <p className="text-white/60 text-sm mt-8">
              Verificación en 24 horas • Sin costo de registro • Cancelación en cualquier momento
            </p>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 4h4a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2H6a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2V6a2 2 0 0 1 2-2z"/>
                  </svg>
                </div>
                <span className="text-xl font-bold">Doctor.mx</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                La red más exclusiva de médicos en México. 
                Pacientes pre-cualificados por IA médica.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Para Médicos</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link to="/connect" className="hover:text-white transition-colors">Cómo funciona</Link></li>
                <li><Link to="/connect/signup" className="hover:text-white transition-colors">Registrarse</Link></li>
                <li><Link to="/connect/login" className="hover:text-white transition-colors">Iniciar sesión</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Dashboard Premium</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Recursos</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentación</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Médica</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Casos de Éxito</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Legal</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link to="/legal/terms" className="hover:text-white transition-colors">Términos</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacidad</Link></li>
                <li><a href="mailto:doctors@doctor.mx" className="hover:text-white transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-white transition-colors">NOM-004</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
            © 2025 Doctor.mx • Todos los derechos reservados • Plataforma Premium para Médicos
          </div>
        </div>
      </footer>
    </div>
  );
}