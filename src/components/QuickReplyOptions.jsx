import { motion } from 'framer-motion';
import { MapPin, HelpCircle, RefreshCw, Save, Copy, MessageCircle } from 'lucide-react';

export default function QuickReplyOptions({ onOptionSelect, isLoading }) {
  const options = [
    {
      id: 'severity',
      label: '¿Qué tan serio es?',
      icon: HelpCircle,
      description: 'Evaluar urgencia',
      action: 'severity_check'
    },
    {
      id: 'find-doctor',
      label: 'Buscar doctor',
      icon: MapPin,
      description: 'Especialista cercano',
      action: 'find_specialist'
    },
    {
      id: 'follow-up',
      label: 'Otra pregunta',
      icon: MessageCircle,
      description: 'Continuar consulta',
      action: 'ask_follow_up'
    },
    {
      id: 'save',
      label: 'Guardar',
      icon: Save,
      description: 'Guardar chat',
      action: 'save_conversation'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      className="w-full mt-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <motion.button
              key={option.id}
              variants={itemVariants}
              onClick={() => onOptionSelect(option.action)}
              disabled={isLoading}
              className="group relative flex flex-col items-center gap-2 px-3 py-2.5 bg-gradient-to-br from-white to-gray-50 border border-ink-border rounded-lg hover:border-brand-400 hover:shadow-md hover:bg-brand-50/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title={option.description}
            >
              <Icon className="w-4 h-4 text-brand-600 group-hover:text-brand-700 transition-colors" />
              <span className="text-xs font-medium text-ink-primary group-hover:text-brand-700 text-center leading-tight">
                {option.label}
              </span>
              <span className="text-xs text-ink-muted group-hover:text-ink-secondary opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-ink-primary text-white px-2 py-1 rounded pointer-events-none">
                {option.description}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}



