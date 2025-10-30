import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

const durationOptions = [
  { value: 'hours', label: 'Horas', examples: ['1-6 horas', '6-12 horas', '12-24 horas'] },
  { value: 'days', label: 'Días', examples: ['1-2 días', '3-5 días', '1 semana'] },
  { value: 'weeks', label: 'Semanas', examples: ['1-2 semanas', '1 mes'] },
  { value: 'months', label: 'Meses', examples: ['2-3 meses', '6+ meses'] }
];

export default function DurationPicker({ onSelect, currentValue }) {
  return (
    <div className="w-full mt-3">
      <p className="text-sm font-medium text-ink-secondary mb-2 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        ¿Cuánto tiempo llevas con estos síntomas?
      </p>
      <div className="flex flex-wrap gap-2">
        {durationOptions.map((category) => (
          <div key={category.value} className="flex flex-col gap-1">
            <span className="text-xs text-ink-muted px-2">{category.label}</span>
            <div className="flex flex-wrap gap-1">
              {category.examples.map((example) => {
                const isSelected = currentValue === example;
                return (
                  <motion.button
                    key={example}
                    onClick={() => onSelect(example)}
                    className={`
                      px-3 py-1.5 rounded-md text-sm font-medium transition-all
                      ${isSelected 
                        ? 'bg-brand-600 text-white shadow-md' 
                        : 'bg-white border border-ink-border text-ink-primary hover:border-brand-400 hover:bg-brand-50/30'
                      }
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {example}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}




