import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function Logo() {
  return (
    <a href="/" className="flex items-center gap-3 group">
      <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-primary-600 rounded-lg flex items-center justify-center shadow-z1 group-hover:shadow-brand transition-all duration-300">
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 4h4a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2H6a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2V6a2 2 0 0 1 2-2z"/>
        </svg>
      </div>
      <span className="text-xl font-bold tracking-tight text-neutrals-text-h transition-colors duration-200 group-hover:text-brand-primary">doctor.mx</span>
    </a>
  )
}

function MetricChip({ value, label, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="text-center"
    >
      <div className="text-3xl font-bold text-neutrals-text-h mb-1 tabular-nums">{value}</div>
      <div className="text-neutrals-text-m text-small">{label}</div>
    </motion.div>
  )
}

function PriceCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.22, type: "spring", stiffness: 80, damping: 18 }}
      className="bg-neutrals-card border border-white/6 rounded-lg p-6 shadow-z1 max-w-sm mx-auto"
    >
      <div className="text-center">
        <div className="text-eyebrow text-neutrals-text-m mb-2 tracking-wider uppercase">MEMBRESÍA PREMIUM</div>
        <div className="text-4xl font-bold text-neutrals-text-h mb-1 tabular-nums">$499</div>
        <div className="text-neutrals-text-m mb-4">MXN / mes</div>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-small text-neutrals-text-m">
            <svg className="w-4 h-4 text-utility-success" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Pacientes pre-cualificados por IA</span>
          </div>
          <div className="flex items-center gap-3 text-small text-neutrals-text-m">
            <svg className="w-4 h-4 text-utility-success" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Sin comisiones por consulta</span>
          </div>
          <div className="flex items-center gap-3 text-small text-neutrals-text-m">
            <svg className="w-4 h-4 text-utility-success" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Dashboard premium incluido</span>
          </div>
        </div>

        <div className="border-t border-white/6 pt-4 mb-4">
          <div className="text-small text-neutrals-text-l">Sin comisiones • Sin intermediarios</div>
          <div className="text-small text-neutrals-text-l mt-1">Factura deducible</div>
        </div>

        <Link
          to="/connect/signup"
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-brand-primary text-white rounded-md font-medium text-body hover:bg-brand-primary-600 transition-all duration-220 hover:translate-y-[-1px] hover:shadow-brand focus:ring-2 focus:ring-brand-primary/90 focus:ring-offset-0"
        >
          Unirme a la Red Premium
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </motion.div>
  )
}

function HowItWorksCard({ step, title, description, time, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.22 }}
      className="bg-neutrals-card border border-white/6 rounded-lg p-6 shadow-z1 hover:shadow-z2 hover:border-white/10 transition-all duration-300"
    >
      <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-primary-600 rounded-md flex items-center justify-center mb-4 shadow-z1">
        <span className="text-lg font-bold text-white">{step}</span>
      </div>
      <h3 className="text-h4 font-semibold text-neutrals-text-h mb-2">{title}</h3>
      <p className="text-small text-neutrals-text-m mb-3 leading-relaxed">{description}</p>
      <div className="text-small text-neutrals-text-l">{time}</div>
    </motion.div>
  )
}

function BenefitCard({ icon, title, description, destacado = false, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.22 }}
      className={`bg-neutrals-card border border-white/6 rounded-lg p-6 shadow-z1 hover:shadow-z2 hover:border-white/10 transition-all duration-300 relative ${
        destacado ? 'border-l-2 border-l-brand-primary-600' : ''
      }`}
    >
      <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-primary-600 rounded-md flex items-center justify-center text-white mb-4 shadow-z1">
        {icon}
      </div>
      <h3 className="text-h4 font-semibold text-neutrals-text-h mb-2">{title}</h3>
      <p className="text-small text-neutrals-text-m leading-relaxed">{description}</p>
    </motion.div>
  )
}

function SpecialtyPill({ specialty, delay = 0 }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.2 }}
      className="inline-block px-4 py-2 bg-white/0 border border-white/10 text-neutrals-text-m rounded-pill text-small font-medium hover:bg-brand-primary/10 hover:text-neutrals-text-h hover:border-brand-primary/20 transition-all duration-200 cursor-pointer"
    >
      {specialty}
    </motion.span>
  )
}

export default function ConnectLanding() {
  const specialties = [
    'Medicina General', 'Dermatología', 'Nutrición Clínica', 'Psicología',
    'Pediatría', 'Ginecología', 'Medicina Interna', 'Psiquiatría',
    'Cardiología', 'Endocrinología', 'Gastroenterología', 'Neurología'
  ]

  return (
    <div className="min-h-screen bg-neutrals-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-neutrals-bg/95 backdrop-blur-md border-b border-white/6">
        <div className="mx-auto flex max-w-container items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-small font-medium text-neutrals-text-m hover:text-neutrals-text-h transition-colors">
              Iniciar sesión
            </Link>
            <Link
              to="/connect/signup"
              className="px-4 py-2 bg-brand-primary text-white rounded-md font-medium text-small hover:bg-brand-primary-600 transition-all duration-220 hover:translate-y-[-1px] hover:shadow-brand"
            >
              Unirme
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-neutrals-bg via-neutrals-bg-alt to-neutrals-bg">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:96px_96px]"></div>
        
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(43,127,255,0.1),transparent_60%)]"></div>

        <div className="relative max-w-container mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.13 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-pill text-eyebrow text-neutrals-text-m mb-6 tracking-wider uppercase"
            >
              <div className="w-1.5 h-1.5 bg-utility-success rounded-full animate-pulse"></div>
              Plataforma Premium para Médicos
            </motion.div>

            {/* Main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.22 }}
              className="text-h1 font-bold text-neutrals-text-h mb-6 leading-tight"
            >
              Sé encontrado por
              <span className="block bg-gradient-to-r from-brand-primary via-brand-teal to-brand-primary bg-clip-text text-transparent">
                IA Médica
              </span>
            </motion.h1>
            
            {/* Subcopy */}
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.22 }}
              className="text-xl text-neutrals-text-m mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Únete a la red más exclusiva de México. Recibe pacientes pre-cualificados 
              por inteligencia artificial. Sin intermediarios, sin comisiones ocultas.
            </motion.p>

            {/* Price Card */}
            <div className="mb-12">
              <PriceCard />
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-2xl mx-auto">
              <MetricChip value="$499" label="mensualidad fija" delay={0.4} />
              <MetricChip value="100%" label="de tus ingresos" delay={0.5} />
              <MetricChip value="24/7" label="referencias IA" delay={0.6} />
            </div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.22 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/connect/signup"
                className="group inline-flex items-center justify-center gap-3 px-8 py-3 bg-brand-primary text-white rounded-md font-semibold text-body hover:bg-brand-primary-600 transition-all duration-220 hover:translate-y-[-1px] hover:shadow-brand focus:ring-2 focus:ring-brand-primary/90 focus:ring-offset-0"
              >
                Unirme a la Red Premium
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <button className="inline-flex items-center justify-center gap-3 px-8 py-3 bg-white/5 backdrop-blur-sm border border-white/10 text-neutrals-text-h rounded-md font-medium text-body hover:bg-white/10 transition-all duration-220">
                Ver demo
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-5-9v.01M12 3v.01" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-h2 font-bold text-neutrals-text-h mb-4">Cómo funciona</h2>
          <p className="text-body text-neutrals-text-m max-w-2xl mx-auto">
            Proceso simple y transparente para unirte a la red más exclusiva de médicos en México
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <HowItWorksCard
            step="1"
            title="Regístrate Premium"
            description="Sube tu cédula profesional y paga la membresía de $499 MXN/mes. Verificación en 24 horas."
            time="24h verificación"
            delay={0.1}
          />
          <HowItWorksCard
            step="2"
            title="Recibe Pacientes IA"
            description="Nuestra IA médica te envía pacientes pre-cualificados con historial completo. Sin intermediarios."
            time="Inmediato"
            delay={0.2}
          />
          <HowItWorksCard
            step="3"
            title="Cobra Directo"
            description="Recibe el 100% de tus ingresos. Pagos directos a tu cuenta. Dashboard premium incluido."
            time="Semanal"
            delay={0.3}
          />
        </div>
      </div>

      {/* Earnings Calculator */}
      <div className="bg-neutrals-bg-alt py-24">
        <div className="max-w-container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-h2 font-bold text-neutrals-text-h mb-4">Calculadora de Ingresos</h2>
            <p className="text-body text-neutrals-text-m max-w-2xl mx-auto">
              Descubre tu potencial de ingresos con pacientes pre-cualificados por IA
            </p>
          </div>

          <div className="bg-neutrals-card border border-white/6 rounded-lg p-8 shadow-z1">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="text-center">
                <div className="text-small text-neutrals-text-m mb-2">Consultas por día</div>
                <div className="text-3xl font-bold text-neutrals-text-h tabular-nums">3-6</div>
                <div className="text-small text-neutrals-text-l">promedio</div>
              </div>
              <div className="text-center">
                <div className="text-small text-neutrals-text-m mb-2">Pago por consulta</div>
                <div className="text-3xl font-bold text-neutrals-text-h tabular-nums">$300</div>
                <div className="text-small text-neutrals-text-l">promedio</div>
              </div>
              <div className="text-center">
                <div className="text-small text-neutrals-text-m mb-2">Ingreso mensual</div>
                <div className="text-3xl font-bold text-neutrals-text-h tabular-nums">$27k-54k</div>
                <div className="text-small text-neutrals-text-l">antes de membresía</div>
              </div>
              <div className="text-center">
                <div className="text-small text-neutrals-text-m mb-2">Neto mensual</div>
                <div className="text-3xl font-bold text-utility-success tabular-nums">$26.5k-53.5k</div>
                <div className="text-small text-neutrals-text-l">después de $499</div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-small text-neutrals-text-m mb-4">
                Membresía fija de $499 MXN/mes • Sin comisiones • Sin intermediarios
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-utility-success/10 border border-utility-success/30 rounded-pill">
                <svg className="w-4 h-4 text-utility-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-utility-success text-small font-medium">ROI promedio: 5,300%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-h2 font-bold text-neutrals-text-h mb-4">Beneficios Premium</h2>
          <p className="text-body text-neutrals-text-m max-w-2xl mx-auto">
            Todo lo que necesitas para crecer tu práctica médica digital
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <BenefitCard
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
            title="IA Médica Avanzada"
            description="Pacientes pre-cualificados con historial completo y triage inteligente"
            destacado={true}
            delay={0.1}
          />
          <BenefitCard
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            title="Sin Comisiones"
            description="Recibe el 100% de tus ingresos. Solo la membresía fija de $499 MXN/mes"
            delay={0.2}
          />
          <BenefitCard
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            title="Dashboard Premium"
            description="Métricas avanzadas, seguimiento de pacientes y análisis de rendimiento"
            delay={0.3}
          />
          <BenefitCard
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
            title="WhatsApp Native"
            description="Atiende desde tu teléfono. Sin apps complicadas ni plataformas lentas"
            delay={0.4}
          />
          <BenefitCard
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            title="Recetas Digitales"
            description="Sistema integrado de e-Rx con QR. Cumple con NOM-004 y NOM-024"
            delay={0.5}
          />
          <BenefitCard
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
            title="Respaldo Legal"
            description="Consentimientos automatizados, auditoría completa y cumplimiento normativo"
            delay={0.6}
          />
        </div>
      </div>

      {/* Specialties */}
      <div className="bg-neutrals-bg-alt py-24">
        <div className="max-w-container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-h2 font-bold text-neutrals-text-h mb-4">Especialidades Premium</h2>
            <p className="text-body text-neutrals-text-m max-w-2xl mx-auto">
              Médicos especialistas más buscados por nuestra IA médica
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {specialties.map((specialty, i) => (
              <SpecialtyPill key={specialty} specialty={specialty} delay={i * 0.02} />
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-br from-neutrals-bg-alt to-neutrals-bg py-24">
        <div className="max-w-container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.22 }}
          >
            <h2 className="text-h2 font-bold text-neutrals-text-h mb-6">
              Únete a la Red Premium
            </h2>
            <p className="text-body text-neutrals-text-m mb-12 max-w-2xl mx-auto">
              Sé parte de la red más exclusiva de médicos en México. 
              Pacientes pre-cualificados por IA, sin comisiones, dashboard premium.
            </p>
            
            <div className="bg-neutrals-card border border-white/6 rounded-lg p-8 mb-12 max-w-sm mx-auto shadow-z1">
              <div className="text-center">
                <div className="text-eyebrow text-neutrals-text-m mb-2 tracking-wider uppercase">MEMBRESÍA PREMIUM</div>
                <div className="text-5xl font-bold text-neutrals-text-h mb-2 tabular-nums">$499</div>
                <div className="text-neutrals-text-m mb-4">MXN / mes</div>
                <div className="text-small text-neutrals-text-l">
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
                className="group inline-flex items-center justify-center gap-3 px-8 py-3 bg-brand-primary text-white rounded-md font-semibold text-body hover:bg-brand-primary-600 transition-all duration-220 hover:translate-y-[-1px] hover:shadow-brand focus:ring-2 focus:ring-brand-primary/90 focus:ring-offset-0"
              >
                Comenzar Ahora
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <button className="inline-flex items-center justify-center gap-3 px-8 py-3 bg-white/5 backdrop-blur-sm border border-white/10 text-neutrals-text-h rounded-md font-medium text-body hover:bg-white/10 transition-all duration-220">
                Agendar Demo
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            
            <p className="text-small text-neutrals-text-l mt-8">
              Verificación en 24 horas • Sin costo de registro • Cancelación en cualquier momento
            </p>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-neutrals-bg border-t border-white/6 py-16">
        <div className="max-w-container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-primary-600 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 4h4a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2H6a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2V6a2 2 0 0 1 2-2z"/>
                  </svg>
                </div>
                <span className="text-lg font-bold text-neutrals-text-h">Doctor.mx</span>
              </div>
              <p className="text-small text-neutrals-text-m leading-relaxed">
                La red más exclusiva de médicos en México. 
                Pacientes pre-cualificados por IA médica.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-neutrals-text-h">Para Médicos</h4>
              <ul className="space-y-3 text-small text-neutrals-text-m">
                <li><Link to="/connect" className="hover:text-neutrals-text-h transition-colors">Cómo funciona</Link></li>
                <li><Link to="/connect/signup" className="hover:text-neutrals-text-h transition-colors">Registrarse</Link></li>
                <li><Link to="/connect/login" className="hover:text-neutrals-text-h transition-colors">Iniciar sesión</Link></li>
                <li><a href="#" className="hover:text-neutrals-text-h transition-colors">Dashboard Premium</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-neutrals-text-h">Recursos</h4>
              <ul className="space-y-3 text-small text-neutrals-text-m">
                <li><a href="#" className="hover:text-neutrals-text-h transition-colors">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-neutrals-text-h transition-colors">Documentación</a></li>
                <li><a href="#" className="hover:text-neutrals-text-h transition-colors">API Médica</a></li>
                <li><a href="#" className="hover:text-neutrals-text-h transition-colors">Casos de Éxito</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-neutrals-text-h">Legal</h4>
              <ul className="space-y-3 text-small text-neutrals-text-m">
                <li><Link to="/legal/terms" className="hover:text-neutrals-text-h transition-colors">Términos</Link></li>
                <li><Link to="/privacy" className="hover:text-neutrals-text-h transition-colors">Privacidad</Link></li>
                <li><a href="mailto:doctors@doctor.mx" className="hover:text-neutrals-text-h transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-neutrals-text-h transition-colors">NOM-004</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/6 pt-8 text-center text-small text-neutrals-text-m">
            © 2025 Doctor.mx • Todos los derechos reservados • Plataforma Premium para Médicos
          </div>
        </div>
      </footer>
    </div>
  );
}