import { motion } from 'framer-motion';
import { Stethoscope } from 'lucide-react';

const specialties = [
  'Medicina General',
  'Cardiología',
  'Neurología',
  'Pediatría',
  'Ginecología',
  'Dermatología',
  'Psicología',
  'Oftalmología',
  'Otorrinolaringología',
  'Gastroenterología',
  'Ortopedia',
  'Urología'
];

export default function SpecialtyPicker({ onSelect, currentValue }) {
  return (
    <div className="w-full mt-3">
      <p className="text-sm font-medium text-ink-secondary mb-2 flex items-center gap-2">
        <Stethoscope className="w-4 h-4" />
        ¿A qué especialidad te gustaría ser referido?
      </p>
      <div className="flex flex-wrap gap-2">
        {specialties.map((specialty) => {
          const isSelected = currentValue === specialty;
          return (
            <motion.button
              key={specialty}
              onClick={() => onSelect(specialty)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${isSelected 
                  ? 'bg-brand-600 text-white shadow-md' 
                  : 'bg-white border border-ink-border text-ink-primary hover:border-brand-400 hover:bg-brand-50/30'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {specialty}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

