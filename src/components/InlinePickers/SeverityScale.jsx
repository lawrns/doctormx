import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, AlertTriangle, XCircle } from 'lucide-react';

const severityOptions = [
  { value: 'green', label: 'Leve', icon: CheckCircle, color: 'text-green-600 bg-green-50 border-green-200' },
  { value: 'yellow', label: 'Moderado', icon: AlertCircle, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  { value: 'orange', label: 'Serio', icon: AlertTriangle, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { value: 'red', label: 'Urgente', icon: XCircle, color: 'text-red-600 bg-red-50 border-red-200' }
];

export default function SeverityScale({ onSelect, currentValue }) {
  return (
    <div className="w-full mt-3">
      <p className="text-sm font-medium text-ink-secondary mb-2">¿Cómo calificarías la urgencia?</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {severityOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = currentValue === option.value;
          
          return (
            <motion.button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className={`
                flex flex-col items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all
                ${isSelected 
                  ? `${option.color} border-current shadow-md scale-105` 
                  : 'bg-white border-ink-border hover:border-ink-border/60 hover:bg-neutral-50'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className={`w-5 h-5 ${isSelected ? 'opacity-100' : 'opacity-60'}`} />
              <span className={`text-xs font-medium ${isSelected ? 'opacity-100' : 'opacity-70'}`}>
                {option.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

