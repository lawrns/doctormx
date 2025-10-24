import { motion } from 'framer-motion';
import { AlertCircle, Check, Clock, Zap } from 'lucide-react';

export default function SeverityWidget({ severity = 'green', message = '' }) {
  const severityConfig = {
    green: {
      label: 'Sin urgencia',
      description: 'No requiere atención inmediata',
      color: 'from-green-400 to-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: Check,
      actionText: 'Sigue las recomendaciones'
    },
    yellow: {
      label: 'Monitorear',
      description: 'Observa la evolución',
      color: 'from-yellow-400 to-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: Clock,
      actionText: 'Si empeora, consulta un especialista'
    },
    orange: {
      label: 'Pronto',
      description: 'Consulta en 24-48 horas',
      color: 'from-orange-400 to-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: AlertCircle,
      actionText: 'Se recomienda una consulta con especialista'
    },
    red: {
      label: '¡Urgente!',
      description: 'Requiere atención inmediata',
      color: 'from-red-500 to-red-700',
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: Zap,
      actionText: 'Llama al 911 o ve a urgencias'
    }
  };

  const config = severityConfig[severity] || severityConfig.green;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`w-full ${config.bg} border ${config.border} rounded-lg p-4 my-4`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-ink-primary">{config.label}</h4>
            <span className="text-xs font-medium text-ink-muted">({config.description})</span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden my-2">
            <motion.div
              className={`h-full bg-gradient-to-r ${config.color}`}
              initial={{ width: 0 }}
              animate={{
                width: {
                  green: '25%',
                  yellow: '50%',
                  orange: '75%',
                  red: '100%'
                }[severity] || '25%'
              }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </div>
          
          <p className="text-sm text-ink-secondary">{config.actionText}</p>
          
          {message && (
            <p className="text-xs text-ink-muted mt-2 italic">
              &quot;{message}&quot;
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
